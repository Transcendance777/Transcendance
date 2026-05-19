const App = () => {
	return (
		<>
		<h1>GAME REV</h1>
		<form action="" method="POST">
		<p>Saissez votre adressse email :</p>
		<input type="email" style={{ width: "230px" }} placeholder="Exemple: TungTungSahur@gmail.com"/>
		<br />
		<p>Saissez votre mot de passe :</p>
		<input type="password" style={{ width: "230px" }}/>
		<br /><br />
		<input type="submit"/>
		</form>
		</>
	)
}

export default App