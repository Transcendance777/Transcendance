import { useState } from 'react'
import Background from '../components/Background'
import InscriptionForm from '../components/InscriptionForm'

const LoginPage = () => {
	const params = new URLSearchParams(window.location.search)
	const hasError = params.get('error')
	const hasToken = params.get('token')
	const [showForm, setShowForm] = useState(!!(hasError || hasToken))

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