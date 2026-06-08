import '../styles/InscriptionForm.css'
import '../index.css'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const InscriptionForm = () => {
	const [isLogin, setIsLogin] = useState(true)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	

	useEffect(() => {
		setEmail('')
		setPassword('')
		setUsername('')
	}, [isLogin])
	
	/*const handleSubmit = async (e) => {
	  e.preventDefault()
	  const response = await axios.post("/api/login", {
		email: email,
		password: password
	  })
	  navigate('../pages/home')
	}*/

	const handleSubmit = async (e) => {
		e.preventDefault()
		navigate('/home')
	}

	return (

		<div className="formBackground">

			<div className="form-logo">
      			<img src="/faviconGameRev.svg" alt="Game Rev" className="form-logo-img" />
   			</div>

			<div className="form-toggle">
				<button
					className={`toggle-btn ${isLogin ? 'active' : ''}`}
					onClick={() => setIsLogin(true)}
				>
					Connexion
				</button>
				<button
					className={`toggle-btn ${!isLogin ? 'active' : ''}`}
					onClick={() => setIsLogin(false)}
				>
					Inscription
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				{!isLogin && (
					<>
						<p className="emailMessage texte">Nom d'utilisateur :</p>
						<input
							className="emailArea"
							type="text"
							placeholder="Exemple: xX_DarkWolf_Xx"
							onChange={(e) => setUsername(e.target.value)}
						/>
						<br />
					</>
				)}

				<p className="emailMessage texte">
					{isLogin ? 'Email/Nom d\'utilisateur :' : 'Adresse email :'}
				</p>
				<input
					className="emailArea"
					type={isLogin ? 'text' : 'email'}
					placeholder={isLogin ? 'Email ou pseudo...' : 'Exemple: TungTungSahur@gmail.com'}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<br />

				<p className="passwordMessage texte">Mot de passe :</p>
				<div className="password-wrapper">
					<input
						className="passwordArea"
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button
						className="password-toggle"
						onClick={() => setShowPassword(!showPassword)}
						type="button"
					>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</button>
				</div>
				<br /><br />

				<input
					type="submit"
					className="submitButton"
					value={isLogin ? 'Se connecter' : "S'inscrire"}
				/>
			</form>

			<div className="form-divider">
				<span>ou</span>
			</div>

			<button className="google-btn">
				<img src="https://www.google.com/favicon.ico" alt="Google" className="google-icon" />
				Continuer avec Google
			</button>

		</div>
	)
}

export default InscriptionForm