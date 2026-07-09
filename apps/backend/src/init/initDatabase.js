import prisma from './initPrisma.js';
import { Prisma } from '@prisma/client';
import { execSync } from 'child_process'; //for execSync function

function quotePgIdentifier(name) {
    return `"${name.replace(/"/g, '""')}"`;
}

function quotePgLiteral(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

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

/**
 * Creates (or updates) the Vault PostgreSQL role and grants CONNECT on the app database.
 * Uses Prisma raw queries — Prisma ORM has no built-in API for role management.
 */
async function ensureVaultDbRole() {
    const roleName = process.env.ROLE_VAULT_DB;
    const password = process.env.VAULT_DB_PW;
    const dbName = process.env.DB_NAME;

    if (!roleName || !password) {
        console.log('⏭️  Vault DB role setup skipped (ROLE_VAULT_DB or VAULT_DB_PW not set).');
        return;
    }

    if (!dbName) {
        console.warn('⚠️  Vault DB role setup skipped (DB_NAME not set).');
        return;
    }

    try {
        const existing = await prisma.$queryRaw`
            SELECT 1 FROM pg_roles WHERE rolname = ${roleName}
        `;

        const quotedRole = Prisma.raw(quotePgIdentifier(roleName));
        const quotedDb = Prisma.raw(quotePgIdentifier(dbName));
        const quotedPassword = Prisma.raw(quotePgLiteral(password));

        if (existing.length === 0) {
            await prisma.$executeRaw`
                CREATE ROLE ${quotedRole} WITH LOGIN PASSWORD ${quotedPassword} CREATEROLE
            `;
            console.log(`✅ Vault DB role created.`);
        } else {
            await prisma.$executeRaw`
                ALTER ROLE ${quotedRole} WITH PASSWORD ${quotedPassword}
            `;
            console.log(`✅ Vault DB role already exists (password updated).`);
        }

        await prisma.$executeRaw`
            GRANT CONNECT ON DATABASE ${quotedDb} TO ${quotedRole}
        `;
        console.log(`✅ CONNECT granted on database "${dbName}" to Vault role.`);
    } catch (error) {
        console.error(`❌ Failed to ensure Vault DB role:`, error);
    }
}

export { syncDatabaseSchema, seedDatabase, ensureVaultDbRole };

