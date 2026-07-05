import '../styles/InscriptionForm.css'
import '../index.css'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const InscriptionForm = () => {
	const { t } = useTranslation()
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
	const [forgotMsg, setForgotMsg] = useState('')
	const [verifCode, setVerifCode] = useState('')
	const [newPassword1, setNewPassword1] = useState('')
	const [newPassword2, setNewPassword2] = useState('')
	const [showNewPass1, setShowNewPass1] = useState(false)
	const [showNewPass2, setShowNewPass2] = useState(false)
	const [resetting, setResetting] = useState(false)

	const ERROR_MAP = {
		'All fields are required.': 'login.err_all_fields',
		'Password must be at least 6 characters.': 'login.err_password_length',
		'This email is already used.': 'login.err_email_used',
		'This username is already taken.': 'login.err_username_taken',
		'Incorrect credentials.': 'login.err_credentials',
		'This account uses Google Sign-In.': 'login.err_google_account',
		'Email/username and password required.': 'login.err_identifier_required',
		'No account found with this email.': 'login.err_no_account',
	}

	const translateError = (msg) => {
		const key = ERROR_MAP[msg]
		return key ? t(key) : msg
	}

	useEffect(() => {
		setEmail('')
		setPassword('')
		setUsername('')
		setErrorMsg('')
	}, [isLogin])

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const token = params.get('token')
		const user = params.get('user')
		const error = params.get('error')

		if (token && user) {
			localStorage.setItem('token', token)
			localStorage.setItem('user', user)
			window.history.replaceState({}, '', '/')
			navigate('/home')
		} else if (error === 'email_conflict') {
			window.history.replaceState({}, '', '/')
			setErrorMsg(t('login.err_email_conflict'))
			setTimeout(() => setErrorMsg(''), 2000)
		} else if (error === 'google') {
			window.history.replaceState({}, '', '/')
			setErrorMsg(t('login.err_google_failed'))
			setTimeout(() => setErrorMsg(''), 2000)
		}
	}, [navigate, t])

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
					setErrorMsg(t('login.all_fields'))
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
			const msg = error.response?.data?.error || t('login.error')
			setErrorMsg(translateError(msg))
		}
	}

	const handleForgotPassword = async () => {
		setForgotMsg('')
		if (!forgotEmail) return setForgotMsg(t('login.email_required'))
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: forgotEmail })
			})
			const data = await res.json()
			if (!res.ok) return setForgotMsg(translateError(data.error))
			setForgotStep(2)
		} catch {
			setForgotMsg(t('login.server_error'))
		}
	}

	const handleVerifyCode = async () => {
		setForgotMsg('')
		if (!verifCode) return setForgotMsg(t('login.code_required'))
		try {
			const res = await fetch('/api/auth/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: forgotEmail, code: verifCode })
			})
			const data = await res.json()
			if (!res.ok) return setForgotMsg(data.error)
			setForgotStep(3)
		} catch {
			setForgotMsg(t('login.server_error'))
		}
	}

	const handleResetPassword = async () => {
		setForgotMsg('')
		if (resetting) return
		if (!newPassword1 || !newPassword2) return setForgotMsg(t('login.fill_fields'))
		if (newPassword1 !== newPassword2) return setForgotMsg(t('login.passwords_match'))
		if (newPassword1.length < 6) return setForgotMsg(t('login.password_length'))
		setResetting(true)
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: forgotEmail, code: verifCode, newPassword: newPassword1 })
			})
			const data = await res.json()
			if (!res.ok) {
				setResetting(false)
				return setForgotMsg(data.error)
			}
			setForgotMsg('✓ ' + t('login.password_reset_success'))
			setTimeout(() => {
				setShowForgotPassword(false)
				setForgotStep(1)
				setForgotEmail('')
				setVerifCode('')
				setNewPassword1('')
				setNewPassword2('')
				setForgotMsg('')
				setResetting(false)
			}, 2000)
		} catch {
			setResetting(false)
			setForgotMsg(t('login.server_error'))
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
					{t('login.login')}
				</button>
				<button
					className={`toggle-btn ${!isLogin ? 'active' : ''}`}
					onClick={() => setIsLogin(false)}
				>
					{t('login.signup')}
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				{!isLogin && (
					<>
						<p className="emailMessage texte">{t('login.username')}</p>
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
					{isLogin ? t('login.email_username') : t('login.email')}
				</p>
				<input
					className="emailArea"
					type={isLogin ? 'text' : 'email'}
					placeholder={isLogin ? 'Email or username...' : 'Example: john@gmail.com'}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<br />

				<p className="passwordMessage texte">{t('login.password')}</p>
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
						{t('login.forgot_password')}
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
					value={isLogin ? t('login.submit_login') : t('login.submit_signup')}
				/>
			</form>

			<div className="form-divider">
				<span>{t('login.or')}</span>
			</div>

			<button
				className="google-btn"
				type="button"
				onClick={() => window.location.href = '/api/auth/google'}
			>
				<img src="https://www.google.com/favicon.ico" alt="Google" className="google-icon" />
				{t('login.google')}
			</button>

			{showForgotPassword && (
				<div className="forgot-modal-overlay" onClick={() => setShowForgotPassword(false)}>
					<div className="forgot-modal" onClick={(e) => e.stopPropagation()}>

						{forgotStep === 1 && (
							<>
								<h3 className="forgot-modal-title">{t('login.forgot_title')}</h3>
								<p className="forgot-modal-text">{t('login.forgot_text')}</p>
								<input
									className="forgot-input"
									type="email"
									placeholder={t('login.forgot_email')}
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
								/>
								{forgotMsg && <p style={{ color: '#f44336', fontFamily: 'policeConthrax', fontSize: '12px', textAlign: 'center' }}>{forgotMsg}</p>}
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setShowForgotPassword(false)}>{t('login.cancel')}</button>
									<button className="forgot-submit-btn" onClick={handleForgotPassword}>{t('login.send')}</button>
								</div>
							</>
						)}

						{forgotStep === 2 && (
							<>
								<h3 className="forgot-modal-title">{t('login.verify_title')}</h3>
								<p className="forgot-modal-text">{t('login.verify_text')}</p>
								<input
									className="forgot-input"
									type="text"
									placeholder={t('login.verify_code')}
									value={verifCode}
									onChange={(e) => setVerifCode(e.target.value)}
								/>
								{forgotMsg && <p style={{ color: '#f44336', fontFamily: 'policeConthrax', fontSize: '12px', textAlign: 'center' }}>{forgotMsg}</p>}
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(1)}>{t('login.back')}</button>
									<button className="forgot-submit-btn" onClick={handleVerifyCode}>{t('login.verify')}</button>
								</div>
							</>
						)}

						{forgotStep === 3 && (
							<>
								<h3 className="forgot-modal-title">{t('login.new_password_title')}</h3>
								<div className="forgot-password-wrapper">
									<input
										className="forgot-input"
										type={showNewPass1 ? 'text' : 'password'}
										placeholder={t('login.new_password')}
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
										placeholder={t('login.confirm_password')}
										value={newPassword2}
										onChange={(e) => setNewPassword2(e.target.value)}
									/>
									<button className="forgot-eye-btn" type="button" onClick={() => setShowNewPass2(!showNewPass2)}>
										{showNewPass2 ? <FiEyeOff /> : <FiEye />}
									</button>
								</div>
								{forgotMsg && <p style={{ color: forgotMsg.includes('✓') ? '#4caf50' : '#f44336', fontFamily: 'policeConthrax', fontSize: '12px', textAlign: 'center' }}>{forgotMsg}</p>}
								<div className="forgot-modal-btns">
									<button className="forgot-cancel-btn" onClick={() => setForgotStep(2)}>{t('login.back')}</button>
									<button className="forgot-submit-btn" onClick={handleResetPassword} disabled={resetting}>{t('login.confirm')}</button>
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