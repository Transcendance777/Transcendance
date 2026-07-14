import prisma from '../init/initPrisma.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const saltRounds = 10;
const REVIEW_COUNT = 60;
const PLAYING_LIST_COUNT = 100;
const REVIEWS_WITH_TEXT = 10;

/**
 * Fill in the review text for the first 10 reviews (index 0 → review #1, etc.).
 * Leave a string empty to keep that review rating-only.
 */
const REVIEW_TEXTS = [
	'papapapapapa bete de jeu', // review 1
	'bof', // review 2
	'ce jeu est nul', // review 3
	'jy ai joue tous les jours je me suis meme pas lave', // review 4
	'pourquoi pas', // review 5
	'je suis déçu', // review 6
	'je suis très déçu', // review 7
	'je suis très très déçu', // review 8
	'je suis très très très déçu', // review 9
	'je suis très très très très déçu', // review 10
];

const shuffle = (array) => {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Jan 2024 → Jun 2026 (30 months). */
const buildMonthSlots = () => {
	const slots = [];
	for (let year = 2024; year <= 2026; year += 1) {
		const maxMonth = year === 2026 ? 6 : 12;
		for (let month = 1; month <= maxMonth; month += 1) {
			slots.push({ year, month: month - 1 });
		}
	}
	return slots;
};

const assignCountsByWeight = (total, weights) => {
	const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
	const counts = weights.map((weight) => Math.floor((weight / weightSum) * total));
	let remaining = total - counts.reduce((sum, count) => sum + count, 0);

	const rankedIndices = weights
		.map((weight, index) => ({ index, weight }))
		.sort((a, b) => b.weight - a.weight)
		.map(({ index }) => index);

	for (let i = 0; remaining > 0; i += 1, remaining -= 1) {
		counts[rankedIndices[i % rankedIndices.length]] += 1;
	}

	return counts;
};

/**
 * Spread entries unevenly across months (some busy, some quiet).
 * Each month gets a random weight so the chart is not flat.
 */
const buildWeightedDates = (count) => {
	const slots = buildMonthSlots();
	const monthWeights = slots.map(() => randomInt(1, 20));
	const countsPerMonth = assignCountsByWeight(count, monthWeights);

	const dates = [];
	for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
		const { year, month } = slots[slotIndex];
		for (let i = 0; i < countsPerMonth[slotIndex]; i += 1) {
			const day = randomInt(1, 28);
			const hour = randomInt(8, 22);
			const minute = randomInt(0, 59);
			dates.push(new Date(Date.UTC(year, month, day, hour, minute, 0)));
		}
	}

	return shuffle(dates).sort((a, b) => a - b);
};

/** Same scale as POST /user/review: UI stars 0.5–5, stored as Math.round(rating * 2). */
const STAR_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const STAR_WEIGHTS = [3, 5, 4, 10, 8, 6, 9, 14, 12, 18];

const toDbRating = (starRating) => Math.round(starRating * 2);

const pickWeightedStarRating = () => {
	const totalWeight = STAR_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
	let roll = Math.random() * totalWeight;

	for (let i = 0; i < STAR_RATINGS.length; i += 1) {
		roll -= STAR_WEIGHTS[i];
		if (roll <= 0) {
			return STAR_RATINGS[i];
		}
	}

	return STAR_RATINGS[STAR_RATINGS.length - 1];
};

const buildRatings = (count) =>
	Array.from({ length: count }, () => toDbRating(pickWeightedStarRating()));

async function seedTestUser() {
	const username = process.env.TEST_USER_NAME;
	const password = process.env.TEST_USER_PW;

	if (!username || !password) {
		throw new Error('TEST_USER_NAME and TEST_USER_PW must be set in .env');
	}

	const games = await prisma.game.findMany({
		select: { id: true, title: true },
		orderBy: { id: 'asc' },
	});

	const minGames = Math.max(REVIEW_COUNT, PLAYING_LIST_COUNT);
	if (games.length < minGames) {
		throw new Error(
			`Need at least ${minGames} games in the database (found ${games.length}). Run the seed first.`,
		);
	}

	const shuffledGames = shuffle(games);
	const reviewGames = shuffledGames.slice(0, REVIEW_COUNT);
	const playingListGames = shuffledGames.slice(0, PLAYING_LIST_COUNT);

	const hashPw = await bcrypt.hash(password, saltRounds);
	const email = `${username}@test.local`;
	const userCreatedAt = new Date('2024-02-14T10:00:00.000Z');

	const { id: userId } = await prisma.users.upsert({
		where: { username },
		update: { passwordHash: hashPw },
		create: {
			username,
			email,
			passwordHash: hashPw,
			createdAt: userCreatedAt,
		},
		select: { id: true },
	});

	await prisma.review.deleteMany({ where: { userId } });
	await prisma.playingList.deleteMany({ where: { userId } });

	const reviewDates = buildWeightedDates(REVIEW_COUNT);
	const playingListDates = buildWeightedDates(PLAYING_LIST_COUNT);
	const ratings = buildRatings(REVIEW_COUNT);

	await prisma.playingList.createMany({
		data: playingListGames.map((game, index) => ({
			userId,
			gameId: game.id,
			addedAt: playingListDates[index],
		})),
	});

	await prisma.review.createMany({
		data: reviewGames.map((game, index) => ({
			userId,
			gameId: game.id,
			rating: ratings[index],
			reviewText:
				index < REVIEWS_WITH_TEXT && REVIEW_TEXTS[index]?.trim()
					? REVIEW_TEXTS[index].trim()
					: null,
			createdAt: reviewDates[index],
			updatedAt: reviewDates[index],
		})),
	});

	const reviewsWithText = REVIEW_TEXTS.filter((text) => text?.trim()).length;

	console.log('Test user ready.');
	console.log(`Username: ${username}`);
	console.log(`Email: ${email}`);
	console.log(`User id: ${userId}`);
	console.log(`Playing list entries: ${PLAYING_LIST_COUNT}`);
	console.log(`Reviews: ${REVIEW_COUNT} (${reviewsWithText} with text)`);
	console.log('Review games for text slots 1–10:');
	reviewGames.slice(0, REVIEWS_WITH_TEXT).forEach((game, index) => {
		console.log(`  ${index + 1}. ${game.title}`);
	});
}

seedTestUser()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
