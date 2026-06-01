import '../styles/NavBar.css'
import '../index.css'
import { useState } from 'react'

const NavBar = () => {
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<nav className="navbar">
			<div className="navbar-left">
				<a href="" className="texte">Games</a>
				<a href="" className="texte">Reviews</a>
				<a href="" className="texte">Friends</a>
				<a href="" className="plus">+</a>
			</div>

			<div className="navbar-center">
				<h1 className="GameRev">GAME REV</h1>
			</div>

			<div className="navbar-right">
				<input type="search" placeholder="Rechercher un jeu..." />
				<a href="" className="texte">Profil</a>
				{/* bouton hamburger visible seulement sur petit écran */}
				<button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
			</div>

			{/* menu déroulant */}
			{menuOpen && (
				<div className="dropdown-menu">
					<a href="" className="texte">Games</a>
					<a href="" className="texte">Reviews</a>
					<a href="" className="texte">Friends</a>
					<a href="" className="texte">+</a>
				</div>
			)}
		</nav>
	)
}

export default NavBar