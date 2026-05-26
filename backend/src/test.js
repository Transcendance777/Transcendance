// console.log("hiiiiii");

//libraries
require('dotenv').config();
const express = require('express'); //require-> import tool/library
const { Pool } = require('pg'); // {} -> import only the tool Pool from pg(postgres) library
const cors = require('cors'); // cors-> tool to comunicate safely with another service

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json());//translates JSON files to JS directly

//connexion PostgreSQL
const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
});

//function to create a table
const initDb = async () => { 
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS login_test (
          id SERIAL PRIMARY KEY,
          email VARCHAR(100) NOT NULL,
          password VARCHAR(255) NOT NULL
        );
      `);
    } catch (err) {
        console.error("Error init DB: ", err);
    }
};
initDb(); //call the function

//create a POST route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; // Validation obligatoire requise par le sujet plus tard
  
    try {
      // Note : Pour votre vrai module sécurité, il faudra obligatoirement hasher le mot de passe ici !
      const queryText = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING id, email';
      const values = [email, password];
      
      const result = await pool.query(queryText, values);
      res.status(201).json({ message: "Utilisateur créé !", email: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'insertion en base." });
    }
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));