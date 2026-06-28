import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import SettingsNavBar from '../components/SettingsNavBar'
import Background from '../components/Background'
import '../styles/SettingsPage.css'
import Footer from '../components/Footer'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const SettingsPage = () => {
	const [username, setUsername] = useState('')
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
	const [showAvatarModal, setShowAvatarModal] = useState(false)
	const [avatarSrc, setAvatarSrc] = useState('')
	const [previewSrc, setPreviewSrc] = useState('')
	const [usernameMsg, setUsernameMsg] = useState('')
	const [passwordMsg, setPasswordMsg] = useState('')
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [deletePassword, setDeletePassword] = useState('')
	const [deletePasswordMsg, setDeletePasswordMsg] = useState('')
	const [showDeletePassword, setShowDeletePassword] = useState(false)
	const [isGoogleAccount, setIsGoogleAccount] = useState(false)
	const [hasCustomAvatar, setHasCustomAvatar] = useState(false)
	const [apiKey, setApiKey] = useState(null)
	const [apiKeyMsg, setApiKeyMsg] = useState('')
	const [showApiKey, setShowApiKey] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const stored = localStorage.getItem('user')
		if (stored) {
			const user = JSON.parse(stored)
			const avatar = getAvatar(user.avatarUrl, user.username)
			setAvatarSrc(avatar)
			setPreviewSrc(avatar)
			if (user.isGoogle) setIsGoogleAccount(true)
			if (user.avatarUrl && user.avatarUrl !== 'default_avatar.png') setHasCustomAvatar(true)
		}
	}, [])

	const handleAvatarChange = (e) => {
		const file = e.target.files[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => setPreviewSrc(reader.result)
		reader.readAsDataURL(file)
	}

	const handleSaveAvatar = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/avatar', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ avatar: previewSrc })
			})
			if (!res.ok) throw new Error('Upload failed')
			const user = JSON.parse(localStorage.getItem('user'))
			user.avatarUrl = previewSrc
			localStorage.setItem('user', JSON.stringify(user))
			setAvatarSrc(previewSrc)
			setHasCustomAvatar(true)
			setShowAvatarModal(false)
		} catch (err) {
			console.error('Erreur avatar:', err)
		}
	}

	const handleRemoveAvatar = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/avatar', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ avatar: 'default_avatar.png' })
			})
			if (!res.ok) throw new Error('Failed')
			const user = JSON.parse(localStorage.getItem('user'))
			user.avatarUrl = 'default_avatar.png'
			localStorage.setItem('user', JSON.stringify(user))
			const defaultAvatar = getAvatar('default_avatar.png', user.username)
			setAvatarSrc(defaultAvatar)
			setPreviewSrc(defaultAvatar)
			setHasCustomAvatar(false)
		} catch (err) {
			console.error('Erreur remove avatar:', err)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		navigate('/')
	}

	const handleSaveUsername = async () => {
		if (!username.trim()) return setUsernameMsg('Please enter a username.')
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/username', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ username })
			})
			const data = await res.json()
			if (!res.ok) return setUsernameMsg(data.error)
			const user = JSON.parse(localStorage.getItem('user'))
			user.username = data.user.username
			localStorage.setItem('user', JSON.stringify(user))
			setUsernameMsg('Username updated ✓')
			setUsername('')
		} catch (err) {
			setUsernameMsg('Server error.')
		}
	}

	const handleUpdatePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword)
			return setPasswordMsg('Please fill in all fields.')
		if (newPassword !== confirmPassword)
			return setPasswordMsg('Passwords do not match.')
		if (newPassword.length < 6)
			return setPasswordMsg('Password must be at least 6 characters.')
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ currentPassword, newPassword })
			})
			const data = await res.json()
			if (!res.ok) return setPasswordMsg(data.error)
			setPasswordMsg('Password updated ✓')
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (err) {
			setPasswordMsg('Server error.')
		}
	}

	const handleDeleteAccount = async () => {
		// Compte Google — pas besoin de mot de passe
		if (!isGoogleAccount && !deletePassword) {
			return setDeletePasswordMsg('Please enter your password.')
		}
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/delete', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ password: deletePassword })
			})
			const data = await res.json()
			if (!res.ok) return setDeletePasswordMsg(data.error)
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			navigate('/')
		} catch (err) {
			setDeletePasswordMsg('Server error.')
		}
	}

	const handleGenerateApiKey = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/apikey', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) return setApiKeyMsg(data.error)
			setApiKey(data.key)
			setShowApiKey(true)
			setApiKeyMsg('API key generated ✓')
		} catch (err) {
			setApiKeyMsg('Server error.')
		}
	}

	const handleRevokeApiKey = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/apikey', {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) return setApiKeyMsg('Server error.')
			setApiKey(null)
			setShowApiKey(false)
			setApiKeyMsg('API key revoked.')
		} catch (err) {
			setApiKeyMsg('Server error.')
		}
	}

	const closeDeleteModal = () => {
		setShowDeleteConfirm(false)
		setDeletePassword('')
		setDeletePasswordMsg('')
		setShowDeletePassword(false)
	}

	return (
		<div className="settings-page">
			<SettingsNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="settings-content">

					{/* Section Compte */}
					<div className="settings-section">
						<h2 className="settings-section-title">Account</h2>

						<div className="settings-item">
							<p className="settings-label">Username</p>
							<div className="settings-input-row">
								<input
									className="settings-input"
									type="text"
									placeholder="New username..."
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
								<button className="settings-save-btn" onClick={handleSaveUsername}>Save</button>
							</div>
							{usernameMsg && (
								<p style={{ color: usernameMsg.includes('✓') ? '#4caf50' : '#f44336', fontSize: '13px', fontFamily: '"policeConthrax", sans-serif' }}>
									{usernameMsg}
								</p>
							)}
						</div>

						<div className="settings-item">
							<p className="settings-label">Profile picture</p>
							<div className="settings-avatar-row">
								<img
									src={avatarSrc}
									alt="avatar"
									className="settings-avatar"
									onClick={() => { setPreviewSrc(avatarSrc); setShowAvatarModal(true) }}
									style={{ cursor: 'pointer' }}
								/>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
									<p className="settings-danger-desc">Click on the picture to change it</p>
									{hasCustomAvatar && (
										<button
											className="settings-danger-btn"
											style={{ fontSize: '11px', padding: '6px 14px' }}
											onClick={handleRemoveAvatar}
										>
											Remove picture
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Section Sécurité — masquée pour les comptes Google */}
					{!isGoogleAccount && (
						<div className="settings-section">
							<h2 className="settings-section-title">Security & Privacy</h2>

							<div className="settings-item">
								<p className="settings-label">Change password</p>
								<div className="settings-password-form">

									<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
										<input
											className="settings-input"
											type={showCurrentPassword ? 'text' : 'password'}
											placeholder="Current password..."
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											style={{ paddingRight: '40px', width: '100%' }}
										/>
										<button type="button" className="settings-eye-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
											{showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
										</button>
									</div>

									<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
										<input
											className="settings-input"
											type={showNewPassword ? 'text' : 'password'}
											placeholder="New password..."
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											style={{ paddingRight: '40px', width: '100%' }}
										/>
										<button type="button" className="settings-eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
											{showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
										</button>
									</div>

									<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
										<input
											className="settings-input"
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder="Confirm new password..."
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											style={{ paddingRight: '40px', width: '100%' }}
										/>
										<button type="button" className="settings-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
											{showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
										</button>
									</div>

									<button className="settings-save-btn" onClick={handleUpdatePassword}>Update password</button>
								</div>
								{passwordMsg && (
									<p style={{ color: passwordMsg.includes('✓') ? '#4caf50' : '#f44336', fontSize: '13px', fontFamily: '"policeConthrax", sans-serif' }}>
										{passwordMsg}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Section API Key */}
					<div className="settings-section">
						<h2 className="settings-section-title">API Key</h2>
						<div className="settings-item">
							<p className="settings-label">External API access</p>
							<p className="settings-danger-desc">Generate a key to access the GameRev public API.</p>

							{apiKey && (
								<div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '10px' }}>
									<input
										className="settings-input"
										type={showApiKey ? 'text' : 'password'}
										value={apiKey}
										readOnly
										style={{ paddingRight: '40px', width: '100%', cursor: 'text' }}
									/>
									<button type="button" className="settings-eye-btn" onClick={() => setShowApiKey(!showApiKey)}>
										{showApiKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
									</button>
								</div>
							)}

							{apiKeyMsg && (
								<p style={{ color: apiKeyMsg.includes('✓') ? '#4caf50' : apiKeyMsg.includes('revoked') ? '#f5a623' : '#f44336', fontSize: '13px', fontFamily: '"policeConthrax", sans-serif', marginTop: '8px' }}>
									{apiKeyMsg}
								</p>
							)}

							<div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
								<button className="settings-save-btn" onClick={handleGenerateApiKey}>
									Generate key
								</button>
								{apiKey && (
									<>
										<button
											className="settings-save-btn"
											onClick={() => { navigator.clipboard.writeText(apiKey); setApiKeyMsg('Copied ✓') }}
										>
											Copy
										</button>
										<button className="settings-danger-btn" onClick={handleRevokeApiKey}>
											Revoke
										</button>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Section Danger */}
					<div className="settings-section settings-danger-section">
						<h2 className="settings-section-title">Danger Zone</h2>

						<div className="settings-item">
							<div className="settings-danger-row">
								<div>
									<p className="settings-label">Log out</p>
									<p className="settings-danger-desc">You will be disconnected from your account.</p>
								</div>
								<button className="settings-danger-btn" onClick={() => setShowLogoutConfirm(true)}>
									Log out
								</button>
							</div>
						</div>

						<div className="settings-item">
							<div className="settings-danger-row">
								<div>
									<p className="settings-label">Delete account</p>
									<p className="settings-danger-desc">This action is irreversible. All your data will be permanently deleted.</p>
								</div>
								<button className="settings-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
									Delete account
								</button>
							</div>
						</div>
					</div>

				</div>
			</Background>

			{/* Modal déconnexion */}
			{showLogoutConfirm && (
				<div className="settings-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">Log out ?</h3>
						<p className="settings-modal-text">Are you sure you want to log out ?</p>
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
							<button className="settings-confirm-danger-btn" onClick={handleLogout}>Log out</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal suppression avec confirmation mot de passe */}
			{showDeleteConfirm && (
				<div className="settings-modal-overlay" onClick={closeDeleteModal}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">Delete account ?</h3>
						<p className="settings-modal-text">
							{isGoogleAccount
								? 'This action is irreversible. Are you sure ?'
								: 'This action is irreversible. Enter your password to confirm.'
							}
						</p>
						{/* Input mot de passe uniquement pour les comptes non-Google */}
						{!isGoogleAccount && (
							<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
								<input
									className="settings-input"
									type={showDeletePassword ? 'text' : 'password'}
									placeholder="Your password..."
									value={deletePassword}
									onChange={(e) => setDeletePassword(e.target.value)}
									style={{ paddingRight: '40px', width: '100%' }}
								/>
								<button type="button" className="settings-eye-btn" onClick={() => setShowDeletePassword(!showDeletePassword)}>
									{showDeletePassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
								</button>
							</div>
						)}
						{deletePasswordMsg && (
							<p style={{ color: '#f44336', fontSize: '13px', fontFamily: '"policeConthrax", sans-serif' }}>
								{deletePasswordMsg}
							</p>
						)}
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={closeDeleteModal}>Cancel</button>
							<button className="settings-confirm-danger-btn" onClick={handleDeleteAccount}>Delete</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal avatar */}
			{showAvatarModal && (
				<div className="settings-modal-overlay" onClick={() => setShowAvatarModal(false)}>
					<div className="avatar-edit-modal" onClick={(e) => e.stopPropagation()}>
						<div className="avatar-edit-left">
							<h3 className="settings-modal-title">Profile picture</h3>
							<label htmlFor="avatar-input" className="avatar-import-btn">
								Import picture
							</label>
							<input
								id="avatar-input"
								type="file"
								accept="image/*"
								style={{ display: 'none' }}
								onChange={handleAvatarChange}
							/>
							<div className="avatar-edit-btns">
								<button className="settings-cancel-btn" onClick={() => setShowAvatarModal(false)}>Cancel</button>
								<button className="settings-save-btn" onClick={handleSaveAvatar}>Save</button>
							</div>
						</div>
						<div className="avatar-edit-right">
							<img src={previewSrc} alt="preview" className="avatar-preview-img" />
						</div>
					</div>
				</div>
			)}
			<Footer />
		</div>
	)
}

export default SettingsPage