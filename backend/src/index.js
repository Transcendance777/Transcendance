// console.log("hiiiiii");

//libraries
require('dotenv').config();
const express = require('express'); //require-> import tool/library
const { Pool } = require('pg'); // {} -> import only the tool Pool from pg(postgres) library
const cors = require('cors'); // cors-> tool to comunicate safely with another service
const { execSync } = require('child_process'); //for execSync function
const { PrismaClient } = require('@prisma/client'); //prisma client

//start prisma client
const prisma = new PrismaClient();
const PORT = process.env.PORT_BACK || 4000;

//checks if DB schema has been changed, if so, update the DB
function syncDatabaseSchema() {
  console.log('🔄 Checking for database schema changes...');
  try {
    // execSync runs the command and blocks execution until it finishes successfully
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema is up to date!');
  } catch (error) {
    console.error('❌ Failed to sync database schema:', error);
    // Exit the process if the DB is out of sync to prevent app errors
    process.exit(1); 
  }
}
syncDatabaseSchema();
// await prisma.$connect();
prisma.$connect();

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json());//translates JSON files to JS directly

//create connexion PostgreSQL
const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
});

//create a POST route -> if data is received on /api/login, heres how its being processed :
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 
  
    try {
      // Note : Pour votre vrai module sécurité, il faudra obligatoirement hasher le mot de passe ici !
      const queryText = 'INSERT INTO login_test(email, password) VALUES($1, $2) RETURNING id, email';
      const values = [email, password];
      
      const result = await pool.query(queryText, values);
      console.log("DATABASE INSERTION SUCCESS:", result.rows[0]);      res.status(201).json({ message: "Utilisateur créé !", email: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'insertion en base." });
    }
  });

app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));