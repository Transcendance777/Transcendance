import ReviewsNavBar from '../components/ReviewsNavBar'
import ReviewsCard from '../components/ReviewsCard'
import Background from '../components/Background'
import '../styles/ReviewsPage.css'

const fakeReviews = [
	{
		author: "Tuntung sahur",
		gameTitle: "Resident Evil",
		gameImage: "https://placehold.co/160x220",
		text: "Ce jeu est incroyable, ce jeu est fantastique, ce jeu est magnifique...",
		rating: 5,
		date: "saturday 04/25/26 00:33"
	},
	{
		author: "Brimbrim patapim",
		gameTitle: "Marvel Rivals",
		gameImage: "https://placehold.co/160x220",
		text: "C'est un jeu de merde sah, tout est guez, dans ce jeu, tout est flingué...",
		rating: 1,
		date: "saturday 04/25/26 00:33"
	},
]

const ReviewsPage = () => {
	return (
		<div className="reviews-page">
			<ReviewsNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="reviews-content">
					{fakeReviews.map((review, i) => (
						<ReviewsCard key={i} review={review} />
					))}
				</div>
			</Background>
		</div>
	)
}

export default ReviewsPage