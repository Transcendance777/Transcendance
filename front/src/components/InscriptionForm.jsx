import '../styles/InscriptionForm.css'
import '../index.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const InscriptionForm = () => {

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	const handleSubmit = async (e) => {
		e.preventDefault()
		const response = await axios.post("http://localhost:3000/api/login", {
			email: email,
			password: password
		})
		navigate('../pages/homePage')
	}

	/*const handleSubmit = async (e) => {
		e.preventDefault()
		navigate('/home')
	}*/
	
	return (
		<div className="formBackground">
			<form onSubmit={handleSubmit}>
				<p className="emailMessage texte">Saissez votre adressse email :</p>
				<input
					className="emailArea"
					type="email"
					placeholder="Exemple: TungTungSahur@gmail.com"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<br />
				<p className="passwordMessage texte">Saissez votre mot de passe :</p>
				<input
					className="passwordArea"
					type="password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<br /><br />
				<input type="submit" />
			</form>
		</div>
	)
}

export default InscriptionForm