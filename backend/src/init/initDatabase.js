import prisma from './initPrisma.js';
import { execSync } from 'child_process'; //for execSync function

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
 * if the database is empty, it fills it with a few games and basic users
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

export { syncDatabaseSchema, seedDatabase };

