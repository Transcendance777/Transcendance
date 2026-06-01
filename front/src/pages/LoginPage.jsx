import { useState } from 'react'
import NavBar from '../components/NavBar'
import Background from '../components/Background'
import InscriptionForm from '../components/InscriptionForm'

const LoginPage = () => {
	const [showForm, setShowForm] = useState(false)
	return (
		<div onClick={() => setShowForm(true)}>
			<Background style={{ justifyContent: "center", alignItems: "center" }}>
				{!showForm && (
					<h1 className="welcomeText">GAME REV</h1>
				)}
				{showForm && (
					<InscriptionForm />
				)}
			</Background>
		</div>
	)
}

export default LoginPage