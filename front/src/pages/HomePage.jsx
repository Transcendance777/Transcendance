import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'

const HomePage = () => {
	return (

		<>
			<HomeNavBar />
			
			<Background style={{ justifyContent: "center", alignItems: "center" }}>
				<h1 className="texte">Bienvenue sur Game Rev</h1>
			</Background>
		</>
	)
}

export default HomePage