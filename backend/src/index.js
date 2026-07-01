//libraries and includes
import 'dotenv/config'; //parse env
import express from 'express'; //import-> import tool/library
import cors from 'cors'; // cors-> tool to comunicate safely with another service
import { execSync } from 'child_process'; //for execSync function
import gamesRouter from './routes/games.js';
import prisma from './init/initPrisma.js'; //prisma singleton instance

// port
const PORT = process.env.PORT_BACK || 4000;

/**
 * checks if DB schema has been changed, if so, update the DB
 */
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

/**
 * if the database is empty, it feels it with a few games and basic users
 * @returns nothing
 */
async function seedDatabase() {
  console.log('🌱 Checking database for seeding...');

  try {
    const gameCount = await prisma.game.count();

    if (gameCount > 0) {
      console.log(`Database already contains ${gameCount} games. Skipping seed script.`);
      return;
    }

    // This triggers Prisma's seeding mechanism
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    // Optional: decide if you want to crash the app if seeding fails
  }
}

syncDatabaseSchema();
await seedDatabase();

// connect prisma client
prisma.$connect();

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json());//translates JSON files to JS directly
app.use('/api/games', gamesRouter);

//create a POST route -> if data is received on /api/login, heres how its being processed :
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 
  
    try {
	// insert user in DB with prisma (for login test, remove later)
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