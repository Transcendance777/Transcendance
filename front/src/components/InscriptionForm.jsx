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
	const [errorMsg, setErrorMsg] = useState('')
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [showForgotPassword, setShowForgotPassword] = useState(false)
	const [forgotEmail, setForgotEmail] = useState('')
	const [forgotStep, setForgotStep] = useState(1)
	const [verifCode, setVerifCode] = useState('')
	const [newPassword1, setNewPassword1] = useState('')
	const [newPassword2, setNewPassword2] = useState('')
	const [showNewPass1, setShowNewPass1] = useState(false)
	const [showNewPass2, setShowNewPass2] = useState(false)

	useEffect(() => {
		setEmail('')
		setPassword('')
		setUsername('')
		setErrorMsg('')
	}, [isLogin])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setErrorMsg('')

		try {
			if (isLogin) {
				const response = await axios.post('/api/auth/login', {
					identifier: email, // le champ "email" sert pour email ou pseudo
					password: password
				})
				// Stocke le token et l'utilisateur
				localStorage.setItem('token', response.data.token)
				localStorage.setItem('user', JSON.stringify(response.data.user))
				navigate('/home')
			} else {
				if (!username || !email || !password) {
					setErrorMsg('Tous les champs sont requis.')
					return
				}
				const response = await axios.post('/api/auth/register', {
					email: email,
					username: username,
					password: password
				})
				// Connexion automatique après inscription
				localStorage.setItem('token', response.data.token)
				localStorage.setItem('user', JSON.stringify(response.data.user))
				navigate('/home')
			}
		} catch (error) {
			const msg = error.response?.data?.error || 'Une erreur est survenue.'
			setErrorMsg(msg)
		}
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
							value={username}
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

				{isLogin && (
					<p className="forgot-password-link" onClick={() => { setShowForgotPassword(true); setForgotStep(1) }}>
						Mot de passe oublié ?
					</p>
				)}

				{errorMsg && (
					<p style={{ color: '#f44336', fontFamily: 'policeConthrax', fontSize: '13px', marginTop: '10px', textAlign: 'center' }}>
						{errorMsg}
					</p>
				)}

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

			{showForgotPassword && (
				<div className="forgot-modal-overlay" onClick={() => setShowForgotPassword(false)}>
					<div className="forgot-modal" onClick={(e) => e.stopPropagation()}>

						{forgotStep === 1 && (
							<>
								<h3 className="forgot-modal-title">Mot de passe oublié</h3>
								<p className="forgot-modal-text">Entrez votre adresse email pour recevoir un code de vérification.</p>
								<input
									className="forgot-input"
									type="email"
									placeholder="Votre email..."
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
								/>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setShowForgotPassword(false)}>Annuler</button>
									<button className="forgot-submit-btn" onClick={() => setForgotStep(2)}>Envoyer</button>
								</div>
							</>
						)}

						{forgotStep === 2 && (
							<>
								<h3 className="forgot-modal-title">Code de vérification</h3>
								<p className="forgot-modal-text">Entrez le code reçu par email.</p>
								<input
									className="forgot-input"
									type="text"
									placeholder="Code de vérification..."
									value={verifCode}
									onChange={(e) => setVerifCode(e.target.value)}
								/>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(1)}>Retour</button>
									<button className="forgot-submit-btn" onClick={() => setForgotStep(3)}>Vérifier</button>
								</div>
							</>
						)}

						{forgotStep === 3 && (
							<>
								<h3 className="forgot-modal-title">Nouveau mot de passe</h3>
								<div className="forgot-password-wrapper">
									<input
										className="forgot-input"
										type={showNewPass1 ? 'text' : 'password'}
										placeholder="Nouveau mot de passe..."
										value={newPassword1}
										onChange={(e) => setNewPassword1(e.target.value)}
									/>
									<button className="forgot-eye-btn" type="button" onClick={() => setShowNewPass1(!showNewPass1)}>
										{showNewPass1 ? <FiEyeOff /> : <FiEye />}
									</button>
								</div>
								<div className="forgot-password-wrapper">
									<input
										className="forgot-input"
										type={showNewPass2 ? 'text' : 'password'}
										placeholder="Confirmer le mot de passe..."
										value={newPassword2}
										onChange={(e) => setNewPassword2(e.target.value)}
									/>
									<button className="forgot-eye-btn" type="button" onClick={() => setShowNewPass2(!showNewPass2)}>
										{showNewPass2 ? <FiEyeOff /> : <FiEye />}
									</button>
								</div>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(2)}>Retour</button>
									<button className="forgot-submit-btn" onClick={() => setShowForgotPassword(false)}>Confirmer</button>
								</div>
							</>
						)}

					</div>
				</div>
			)}

		</div>
	)
}

export default InscriptionForm