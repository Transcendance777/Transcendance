import axios from 'axios'

const NavBar = () => {
	return (
		<div style={{ backgroundColor: "black" }}>
			<nav className="navbar">
				<div className="navbar-left">
					<a href="" className="texte">Games</a>
					<a href="" className="texte">Reviews</a>
					<a href="" className="texte">Friends</a>
					<a href="" className="texte" style={{ fontSize: "35px"}}>+</a>
				</div>
				<div className="navbar-center">
					<h1 className="GameRev">GAME REV</h1>
				</div>
				<div className="navbar-right">
					<input type="search" placeholder="Rechercher un jeu..." />
					<a href="" className="texte">Profil</a>
				</div>
			</nav>
		</div>
	)
}

const Background = ({children, ...rest}) =>{
	return (
		<div className="backgroundImage" {...rest}>
			<div className="backgroundOverlay"></div>
			{children}
		</div>
	)
}

const App = () => {

	return (
		<>
		<NavBar />
		<Background style={{ justifyContent: "center", alignItems: "center" }}>
			<p>Connected !</p>
		</Background>
		</>
	)
}

export default App