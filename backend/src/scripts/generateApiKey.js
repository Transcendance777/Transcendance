import prisma from '../init/initPrisma.js';
import { randomUUID } from 'crypto'; // module natif Node.js, pas besoin d'installer

async function generateKey() {

  // Générer une clé unique avec le module crypto de Node
  // randomUUID() produit quelque chose comme "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  // On ajoute un préfixe "sk_" pour la reconnaître facilement (convention)
  const apiKey = `sk_${randomUUID()}`;
  const adminApiKey = `sk_${randomUUID()}`;

  // La sauvegarder en DB
  await prisma.apiKey.create({
    data: {
      userId: 1,
      key: apiKey,
      isActive: true
    }
  });
  await prisma.apiKey.create({
    data: {
      userId: 2,
      key: adminApiKey,
      isActive: true,
      scope: "admin"
    }
  });

  console.log('Clé regular :', apiKey);
  console.log('Clé admin :', adminApiKey);
  // Copie cette valeur, tu en auras besoin pour tester
}

generateKey();