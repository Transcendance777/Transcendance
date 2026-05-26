DROP TABLE IF EXISTS users CASCADE; --supprime la table si existe deja
--CASCADE = supp les données reliées ?


--créer une table
CREATE TABLE users (
    id SERIAL PRIMARY KEY, --génère id auto incrémenté
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(70) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

--insérer data dans une table
INSERT INTO users (username, email, password_hash)
VALUES 
('Yasser', 'y@gmail.com', 'pw123'),
('Ugo', 'u@gmail.com', 'pw456');

--modifier
UPDATE users
SET email = 'newEmail@gmail.com'
WHERE id = 2;

DELETE FROM users
WHERE username = 'Yasser';