import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg'; //adapter wthv that means
import { Pool } from 'pg';

//create connexion to PostgreSQL Database
const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

//start prisma client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// connect prisma client
prisma.$connect();

export default prisma;
