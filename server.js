const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

// Conexão com o banco
const db = new sqlite3.Database('./database.db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home', 'index.html'));
});

// Rota para cadastro de usuário
app.post('/register', async (req, res) => {
    const { name, email, password, is_dev } = req.body;

    // Verificação básica dos campos obrigatórios
    if (!name || !email || !password) {
        return res.status(400).send('Todos os campos são obrigatórios!');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário no banco de dados
    const query = `INSERT INTO users (name, email, password, is_dev) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, email, hashedPassword, is_dev ? 1 : 0], function(err) {
        if (err) {
            return res.status(500).send('Erro ao cadastrar usuário');
        }
        res.status(201).send('Usuário cadastrado com sucesso');
    });
});

// Rota para login de usuário
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro no servidor' });
      }
  
      if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }
  
      // Verificar a senha usando bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }
  
      // Gerar o "@" como combinação do primeiro nome + 3 primeiras letras do email
      const firstName = user.name.split(' ')[0];
      const emailPrefix = email.slice(0, 3);
      const userHandle = `${firstName}${emailPrefix}`;
  
      // Enviar o tipo de usuário, nome e handle para o cliente
      res.status(200).json({
        is_dev: user.is_dev === 1,
        name: user.name,
        handle: userHandle
      });
    });
}); 

// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
