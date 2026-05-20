import axios from 'axios'

const App = () => {

	const titreStyle = {

	}
	return (
		<>
		<div style={{ backgroundColor: "black", minHeight: "100vh" }}>
		<nav className="navbar">
		<h1 className="GameRev">GAME REV</h1>
		<input type="search" placeholder="Rechercher un jeu..." />
		<a href="" className="texte">Games</a>
		<a href="" className="texte">Reviews</a>
		<a href="" className="texte">Profil</a>
		</nav>
		<div className="hero">
		<div className="formBackground">
		<form action="" method="POST">
		<p className="emailMessage texte">Saissez votre adressse email :</p>
		<input className="emailArea" type="email" placeholder="Exemple: TungTungSahur@gmail.com"/>
		<br />
		<p className="passwordMessage texte">Saissez votre mot de passe :</p>
		<input className="passwordArea" type="password"/>
		<br /><br />
		<input type="submit"/>
		</form>
		</div>
		</div>
		</div>
		</>
	)
}

export default App