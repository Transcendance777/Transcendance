import '../styles/InscriptionForm.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import {
	validateCredentialPassword,
	validateEmail,
	validateLoginIdentifier,
	validatePassword,
	validatePasswordMatch,
	validateResetCode,
	validateUsername,
} from '../utils/validation.js'

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
		'Please use a valid email address (Gmail, Hotmail, Yahoo or Outlook).': 'login.err_email_domain',
		'Invalid username.': 'validation.username_required',
		'Username must be between 3 and 30 characters.': 'validation.username_length',
		'Username may only contain letters, numbers, and underscores.': 'validation.username_chars',
		'Password is too long.': 'validation.password_too_long',
		'Invalid verification code.': 'validation.invalid_code',
		'Email required.': 'login.email_required',
	}

	const translateError = (msg) => {
		const key = ERROR_MAP[msg]
		return key ? t(key) : msg
	}

	const showError = (msg) => {
		setErrorMsg(msg)
		setTimeout(() => setErrorMsg(''), 2000)
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
			showError(t('login.err_email_conflict'))
		} else if (error === 'google') {
			window.history.replaceState({}, '', '/')
			showError(t('login.err_google_failed'))
		}
	}, [navigate, t])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setErrorMsg('')

		try {
			if (isLogin) {
				const identifierResult = validateLoginIdentifier(email)
				if (!identifierResult.ok) {
					showError(t(identifierResult.errorKey))
					return
				}
				const passwordResult = validateCredentialPassword(password, { requiredKey: 'login.err_identifier_required' })
				if (!passwordResult.ok) {
					showError(t(passwordResult.errorKey))
					return
				}
				const res = await fetch('/api/auth/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ identifier: identifierResult.value, password: passwordResult.value })
				})
				const data = await res.json()
				if (!res.ok) {
					showError(translateError(data.error || t('login.error')))
					return
				}
				localStorage.setItem('token', data.token)
				localStorage.setItem('user', JSON.stringify(data.user))
				navigate('/home')
			} else {
				const emailResult = validateEmail(email)
				if (!emailResult.ok) {
					showError(emailResult.errorKey === 'login.err_email_domain'
						? t('login.err_email_domain')
						: t(emailResult.errorKey))
					return
				}
				const usernameResult = validateUsername(username)
				if (!usernameResult.ok) {
					showError(t(usernameResult.errorKey))
					return
				}
				const passwordResult = validatePassword(password)
				if (!passwordResult.ok) {
					showError(t(passwordResult.errorKey))
					return
				}
				const res = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: emailResult.value,
						username: usernameResult.value,
						password: passwordResult.value,
					})
				})
				const data = await res.json()
				if (!res.ok) {
					showError(translateError(data.error || t('login.error')))
					return
				}
				localStorage.setItem('token', data.token)
				localStorage.setItem('user', JSON.stringify(data.user))
				navigate('/home')
			}
		} catch (error) {
			showError(t('login.error'))
		}
	}

	const handleForgotPassword = async () => {
		setForgotMsg('')
		const emailResult = validateEmail(forgotEmail)
		if (!emailResult.ok) {
			return setForgotMsg(emailResult.errorKey === 'validation.all_fields'
				? t('login.email_required')
				: t(emailResult.errorKey))
		}
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: emailResult.value })
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
		const codeResult = validateResetCode(verifCode)
		if (!codeResult.ok) return setForgotMsg(t(codeResult.errorKey))
		try {
			const res = await fetch('/api/auth/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), code: codeResult.value })
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
		const passwordResult = validatePassword(newPassword1, { requiredKey: 'login.fill_fields' })
		if (!passwordResult.ok) return setForgotMsg(t(passwordResult.errorKey))
		const matchResult = validatePasswordMatch(newPassword1, newPassword2)
		if (!matchResult.ok) return setForgotMsg(t(matchResult.errorKey))
		setResetting(true)
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: forgotEmail.trim().toLowerCase(),
					code: verifCode.trim(),
					newPassword: passwordResult.value,
				})
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
							id="username"
							name="username"
							autoComplete="username"
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
					id="email"
					name="email"
					autoComplete={isLogin ? 'username' : 'email'}
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
						id="password"
						name="password"
						autoComplete={isLogin ? 'current-password' : 'new-password'}
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
					<p style={{
						color: '#f44336',
						fontFamily: 'policeConthrax',
						fontSize: '13px',
						marginTop: '10px',
						textAlign: 'center',
						maxWidth: '250px',
						margin: '10px auto 0',
						lineHeight: '1.5',
						wordWrap: 'break-word'
					}}>
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
									id="forgot-email"
									name="forgot-email"
									autoComplete="email"
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
									id="verif-code"
									name="verif-code"
									autoComplete="one-time-code"
									className="forgot-input"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={6}
									placeholder={t('login.verify_code')}
									value={verifCode}
									onChange={(e) => setVerifCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
										id="new-password"
										name="new-password"
										autoComplete="new-password"
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
										id="confirm-password"
										name="confirm-password"
										autoComplete="new-password"
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