CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_image TEXT DEFAULT 'dummy.png',
    is_dev BOOLEAN NOT NULL DEFAULT 0
);
