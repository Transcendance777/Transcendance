import prisma from '../init/initPrisma.js';
import 'dotenv/config';
import crypto from 'crypto';

const generateToken = () => 'sk_' + crypto.randomBytes(32).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const REGULAR_EMAIL = 'fakeEmail3982033728739@gmail.com';
const ADMIN_EMAIL = 'capitan7849282342@gmail.com';

/**
 * create 2 users and their API keys to test the public API
 */
async function insertKeys() {
  if (!process.env.TEST_API_KEY || !process.env.ADMIN_API_KEY) {
    throw new Error('TEST_API_KEY and ADMIN_API_KEY must be set in .env');
  }

  const hashPw = hashToken(generateToken());

  const { id } = await prisma.users.upsert({
    where: { email: REGULAR_EMAIL },
    update: {},
    create: {
      username: 'fakeUsername',
      email: REGULAR_EMAIL,
      passwordHash: hashPw,
    },
    select: { id: true },
  });

  const adminHash = hashToken(generateToken());

  const { id: adminId } = await prisma.users.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      username: 'elCapitan',
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
    },
    select: { id: true },
  });

  const apiKey = hashToken(process.env.TEST_API_KEY);
  const adminApiKey = hashToken(process.env.ADMIN_API_KEY);

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

  console.log('Test users and API keys ready.');
  console.log('Regular user id:', id, '| use TEST_API_KEY from .env');
  console.log('Admin user id:', adminId, '| use ADMIN_API_KEY from .env');
}

insertKeys()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
