import axios from 'axios'

const NavBar = () => {
	return (
		<div style={{ backgroundColor: "black"}}>
			<nav className="navbar">
				<h1 className="GameRev">GAME REV</h1>
				<input type="search" placeholder="Rechercher un jeu..." />
				<a href="" className="texte">Games</a>
				<a href="" className="texte">Reviews</a>
				<a href="" className="texte">Profil</a>
			</nav>
		</div>
	)
}

const Background = () =>{
	return (
		<div className="backgroundImage">
			<div className="backgroundOverlay"></div>
		</div>
	)
}

const InscriptionForm = () => {
	return (
		<div className="formBackground">
			<form action="" method="POST">
				<p className="emailMessage texte">Saissez votre adressse email :</p>
				<input className="emailArea" type="email" placeholder="Exemple: TungTungSahur@gmail.com" />
				<br />
				<p className="passwordMessage texte">Saissez votre mot de passe :</p>
				<input className="passwordArea" type="password" />
				<br /><br />
				<input type="submit" />
			</form>
		</div>
	)
}

const App = () => {

	return (
		<>
		<NavBar />
		<Background />
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
		</>
	)
}

export default App