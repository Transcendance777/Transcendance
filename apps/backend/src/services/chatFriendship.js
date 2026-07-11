import prisma from '../init/initPrisma.js';

export const areChatFriends = async (userIdA, userIdB) => {
	if (userIdA === userIdB) return false;

	const friendship = await prisma.friendship.findFirst({
		where: {
			status: 'accepted',
			OR: [
				{ userId1: userIdA, userId2: userIdB },
				{ userId1: userIdB, userId2: userIdA },
			],
		},
		select: { userId1: true },
	});

	return Boolean(friendship);
};

export const getChatFriendIds = async (userId, candidateIds) => {
	if (candidateIds.length === 0) return new Set();

	const friendships = await prisma.friendship.findMany({
		where: {
			status: 'accepted',
			OR: [
				{ userId1: userId, userId2: { in: candidateIds } },
				{ userId2: userId, userId1: { in: candidateIds } },
			],
		},
		select: { userId1: true, userId2: true },
	});

	return new Set(friendships.map(friendship => (
		friendship.userId1 === userId ? friendship.userId2 : friendship.userId1
	)));
};
