//libraries and includes
import 'dotenv/config'; //parse env
import express from 'express'; //import-> import tool/library
import cors from 'cors'; // cors-> tool to comunicate safely with another service
import { syncDatabaseSchema, seedDatabase } from './init/initDatabase.js';

import prisma from './init/initPrisma.js'; //prisma singleton instance
// port du back
const PORT = process.env.PORT_BACK || 4000;

//setup database
syncDatabaseSchema();
await seedDatabase();

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json());//translates JSON files to JS directly

// * test route just for login, remove later
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

// test API publique
import reviewsRouter from './routes/reviews.js';
app.use('/api', reviewsRouter);

//infinite loop that listens to connection arriving on the backend port
app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));