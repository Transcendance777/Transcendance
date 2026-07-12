import prisma from '../init/initPrisma.js';
import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { vaultSecrets } from '../init/initVault.js'; //secrets Vault

const saltRounds = 10;
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const REGULAR_EMAIL = 'fakeEmail3982033728739@gmail.com';
const ADMIN_EMAIL = 'capitan7849282342@gmail.com';

/**
 * create 2 users and their API keys to test the public API
 */
async function insertKeys() {
  if (!vaultSecrets.TEST_API_KEY || !vaultSecrets.ADMIN_API_KEY) {
    throw new Error('TEST_API_KEY and ADMIN_API_KEY must be set in .env');
  }
  if (!vaultSecrets.REGULAR_USER_PASSWORD || !vaultSecrets.ADMIN_USER_PASSWORD) {
    throw new Error('REGULAR_USER_PASSWORD and ADMIN_USER_PASSWORD must be set in .env');
  }

  const pw = vaultSecrets.REGULAR_USER_PASSWORD;
  const hashPw = await bcrypt.hash(pw, saltRounds);

  const { id } = await prisma.users.upsert({
    where: { email: REGULAR_EMAIL },
    update: { passwordHash: hashPw },
    create: {
      username: 'fakeUsername',
      email: REGULAR_EMAIL,
      passwordHash: hashPw,
    },
    select: { id: true },
  });

  const adminPw = vaultSecrets.ADMIN_USER_PASSWORD;
  const adminHash = await bcrypt.hash(adminPw, saltRounds);

  const { id: adminId } = await prisma.users.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminHash },
    create: {
      username: 'elCapitan',
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
    },
    select: { id: true },
  });

  const apiKey = hashToken(vaultSecrets.TEST_API_KEY);
  const adminApiKey = hashToken(vaultSecrets.ADMIN_API_KEY);

  await prisma.apiKey.upsert({
    where: { userId: id },
    update: { key: apiKey, isActive: true, scope: 'regular' },
    create: {
      key: apiKey,
      isActive: true,
      userId: id,
    },
  });

  await prisma.apiKey.upsert({
    where: { userId: adminId },
    update: { key: adminApiKey, isActive: true, scope: 'admin' },
    create: {
      key: adminApiKey,
      isActive: true,
      scope: 'admin',
      userId: adminId,
    },
  });

  // console.log('Test users and API keys ready.');
  // console.log('Regular user:', REGULAR_EMAIL, '| password: REGULAR_USER_PASSWORD from .env');
  // console.log('Admin user:', ADMIN_EMAIL, '| password: ADMIN_USER_PASSWORD from .env');
  // console.log('Regular user id:', id, '| API key: TEST_API_KEY from .env');
  // console.log('Admin user id:', adminId, '| API key: ADMIN_API_KEY from .env');
}

insertKeys()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
