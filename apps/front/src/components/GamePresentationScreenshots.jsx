import { useState } from 'react'
import '../styles/GamePresentationScreenshots.css'

const GamePresentationScreenshots = ({ screenshots }) => {
	const [activeIndex, setActiveIndex] = useState(null)

	const prev = () => setActiveIndex(i => Math.max(i - 1, 0))
	const next = () => setActiveIndex(i => Math.min(i + 1, screenshots.length - 1))

	return (
		<>
			<div className="gamepresentation-screenshots-grid">
				{screenshots.map((src, i) => (
					<img
						key={i}
						src={src}
						alt={`screenshot ${i + 1}`}
						className="gamepresentation-screenshot-thumb"
						onClick={() => setActiveIndex(i)}
					/>
				))}
			</div>

			{activeIndex !== null && (
				<div className="gamepresentation-screenshot-overlay" onClick={() => setActiveIndex(null)}>
					<button className="gamepresentation-nav-btn" onClick={(e) => { e.stopPropagation(); prev() }}>&#8249;</button>
					<img
						src={screenshots[activeIndex]}
						alt="screenshot"
						className="gamepresentation-screenshot-fullscreen"
						onClick={(e) => e.stopPropagation()}
					/>
					<button className="gamepresentation-nav-btn" onClick={(e) => { e.stopPropagation(); next() }}>&#8250;</button>
				</div>
			)}
		</>
	)
}

export default GamePresentationScreenshots