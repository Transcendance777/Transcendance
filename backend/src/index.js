//libraries and includes
import 'dotenv/config'; //parse env
import express from 'express'; //import-> import tool/library
import cors from 'cors'; // cors-> tool to comunicate safely with another service
import { execSync } from 'child_process'; //for execSync function

import prisma from './init/initPrisma.js'; //prisma singleton instance

// port
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
    console.log('🔄 Wiping and resetting database for a clean start...');

    try {
      // If a normal push fails, force a clean reset of the local DB
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      console.log('✨ Database reset and schema applied cleanly!');
    } catch (resetError) {
      console.error('❌ Critical failure updating database schema:', resetError);
      process.exit(1); 
    }
  }
}

function seedDatabase() {
  console.log('🌱 Seeding the database...');
  try {
    // This triggers Prisma's seeding mechanism
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    // Optional: decide if you want to crash the app if seeding fails
  }
}

syncDatabaseSchema();
seedDatabase();

// connect prisma client
prisma.$connect();
console.log('✅ Prisma connected to database!');

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json());//translates JSON files to JS directly

//create a POST route -> if data is received on /api/login, heres how its being processed :
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 
  
    try {
	// insert user in DB with SQL
    //   const queryText = 'INSERT INTO login_test(email, password) VALUES($1, $2) RETURNING id, email';
    //   const values = [email, password];
      
    //   const result = await pool.query(queryText, values);
    //   console.log("DATABASE INSERTION SUCCESS:", result.rows[0]);      
	//   res.status(201).json({ message: "Utilisateur créé !", email: result.rows[0] });

	// insert user in DB with prisma
	// * Hash passwords !!
		const newUser = await prisma.login_test.create({
			data: {
				email: email,
				password: password,
			},
			select: { //to return those values so we can print them
				id: true,
				email: true,
			}
		});
		console.log("DATABASE INSERTION SUCCESS:", newUser);
		res.status(201).json({ message: "Utilisateur créé !", email: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'insertion en base." });
    }
  });

app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));