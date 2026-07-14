const toStoredRatingIndex = (storedRating) => {
	if (storedRating >= 1 && storedRating <= 10) {
		return storedRating - 1;
	}
	return null;
};

const buildRatingDistributionFromReviews = (reviews) => {
	const distribution = Array.from({ length: 10 }, (_, i) => ({
		rating: (i + 1) / 2,
		count: 0,
	}));

	for (const review of reviews) {
		const index = toStoredRatingIndex(review.rating);
		if (index !== null && index >= 0 && index < 10) {
			distribution[index].count++;
		}
	}

	return distribution;
};

export { buildRatingDistributionFromReviews };
