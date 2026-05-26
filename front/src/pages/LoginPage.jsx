import NavBar from '../components/NavBar'
import Background from '../components/Background'
import InscriptionForm from '../components/InscriptionForm'

const LoginPage = () => {
	return (
		<>
			<NavBar />
			<Background style={{ justifyContent: "center", alignItems: "center" }}>
				<InscriptionForm />
			</Background>
		</>
	)
}

export default LoginPage