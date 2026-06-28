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

	// Récupère le token Google depuis l'URL après le callback OAuth
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const token = params.get('token')
		const user = params.get('user')
		if (token && user) {
			localStorage.setItem('token', token)
			localStorage.setItem('user', user)
			window.history.replaceState({}, '', '/')
			navigate('/home')
		}
	}, [navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setErrorMsg('')

		try {
			if (isLogin) {
				const response = await axios.post('/api/auth/login', {
					identifier: email,
					password: password
				})
				localStorage.setItem('token', response.data.token)
				localStorage.setItem('user', JSON.stringify(response.data.user))
				navigate('/home')
			} else {
				if (!username || !email || !password) {
					setErrorMsg('All fields are required.')
					return
				}
				const response = await axios.post('/api/auth/register', {
					email: email,
					username: username,
					password: password
				})
				localStorage.setItem('token', response.data.token)
				localStorage.setItem('user', JSON.stringify(response.data.user))
				navigate('/home')
			}
		} catch (error) {
			const msg = error.response?.data?.error || 'An error occurred.'
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
					Login
				</button>
				<button
					className={`toggle-btn ${!isLogin ? 'active' : ''}`}
					onClick={() => setIsLogin(false)}
				>
					Sign up
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				{!isLogin && (
					<>
						<p className="emailMessage texte">Username :</p>
						<input
							className="emailArea"
							type="text"
							placeholder="Example: xX_DarkWolf_Xx"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<br />
					</>
				)}

				<p className="emailMessage texte">
					{isLogin ? 'Email / Username :' : 'Email address :'}
				</p>
				<input
					className="emailArea"
					type={isLogin ? 'text' : 'email'}
					placeholder={isLogin ? 'Email or username...' : 'Example: john@gmail.com'}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<br />

				<p className="passwordMessage texte">Password :</p>
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
						Forgot password ?
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
					value={isLogin ? 'Log in' : 'Sign up'}
				/>
			</form>

			<div className="form-divider">
				<span>or</span>
			</div>

			<button
				className="google-btn"
				type="button"
				onClick={() => window.location.href = '/api/auth/google'}
			>
				<img src="https://www.google.com/favicon.ico" alt="Google" className="google-icon" />
				Continue with Google
			</button>

			{showForgotPassword && (
				<div className="forgot-modal-overlay" onClick={() => setShowForgotPassword(false)}>
					<div className="forgot-modal" onClick={(e) => e.stopPropagation()}>

						{forgotStep === 1 && (
							<>
								<h3 className="forgot-modal-title">Forgot password</h3>
								<p className="forgot-modal-text">Enter your email address to receive a verification code.</p>
								<input
									className="forgot-input"
									type="email"
									placeholder="Your email..."
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
								/>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setShowForgotPassword(false)}>Cancel</button>
									<button className="forgot-submit-btn" onClick={() => setForgotStep(2)}>Send</button>
								</div>
							</>
						)}

						{forgotStep === 2 && (
							<>
								<h3 className="forgot-modal-title">Verification code</h3>
								<p className="forgot-modal-text">Enter the code you received by email.</p>
								<input
									className="forgot-input"
									type="text"
									placeholder="Verification code..."
									value={verifCode}
									onChange={(e) => setVerifCode(e.target.value)}
								/>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(1)}>Back</button>
									<button className="forgot-submit-btn" onClick={() => setForgotStep(3)}>Verify</button>
								</div>
							</>
						)}

						{forgotStep === 3 && (
							<>
								<h3 className="forgot-modal-title">New password</h3>
								<div className="forgot-password-wrapper">
									<input
										className="forgot-input"
										type={showNewPass1 ? 'text' : 'password'}
										placeholder="New password..."
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
										placeholder="Confirm password..."
										value={newPassword2}
										onChange={(e) => setNewPassword2(e.target.value)}
									/>
									<button className="forgot-eye-btn" type="button" onClick={() => setShowNewPass2(!showNewPass2)}>
										{showNewPass2 ? <FiEyeOff /> : <FiEye />}
									</button>
								</div>
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(2)}>Back</button>
									<button className="forgot-submit-btn" onClick={() => setShowForgotPassword(false)}>Confirm</button>
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