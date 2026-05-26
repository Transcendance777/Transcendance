import Background from '../components/Background'
import NavBar from '../components/NavBar'

const HomePage = () => {
	return (

		<>
			<NavBar />
			
			<Background style={{ justifyContent: "center", alignItems: "center" }}>
				<h1 className="texte">Bienvenue sur Game Rev</h1>
			</Background>
		</>
	)
}

export default HomePage