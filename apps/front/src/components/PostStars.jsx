import { useState } from 'react'
import '../styles/PostStars.css'

const PostStars = ({ onRate }) => {
	const [hovered, setHovered] = useState(null)
	const [selected, setSelected] = useState(null)

	const stars = [1, 2, 3, 4, 5]

	return (
		<div className="stars-container">
			{stars.map((star) => (
				<div key={star} className="star-wrapper">
					{/* demi étoile gauche */}
					<span
						className={`star-half left ${(hovered || selected) >= star - 0.5 ? 'active' : ''}`}
						onMouseEnter={() => setHovered(star - 0.5)}
						onMouseLeave={() => setHovered(null)}
						onClick={() => { setSelected(star - 0.5); onRate(star - 0.5) }}
					>★</span>
					{/* étoile entière droite */}
					<span
						className={`star-half right ${(hovered || selected) >= star ? 'active' : ''}`}
						onMouseEnter={() => setHovered(star)}
						onMouseLeave={() => setHovered(null)}
						onClick={() => { setSelected(star); onRate(star) }}
					>★</span>
				</div>
			))}
		</div>
	)
}

export default PostStars