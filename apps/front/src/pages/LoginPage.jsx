import { useState } from 'react'
import Background from '../components/Background'
import InscriptionForm from '../components/InscriptionForm'
import Footer from '../components/Footer'

const LoginPage = () => {
	const params = new URLSearchParams(window.location.search)
	const hasError = params.get('error')
	const hasToken = params.get('token')
	const [showForm, setShowForm] = useState(!!(hasError || hasToken))

	return (
		<div onClick={() => setShowForm(true)} style={{ backgroundColor: 'black' }}>
			<Background
				style={{
					justifyContent: "center",
					alignItems: "center",
					minHeight: showForm ? 'calc(100vh - 65px)' : '100vh'
				}}
			>
				{!showForm && (
					<h1 className="welcomeText">GAME REV</h1>
				)}
				{showForm && (
					<InscriptionForm />
				)}
			</Background>
			{showForm && <Footer />}
		</div>
	)
}

export default LoginPage