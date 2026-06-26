import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import SettingsNavBar from '../components/SettingsNavBar'
import Background from '../components/Background'
import '../styles/SettingsPage.css'

const SettingsPage = () => {
	const [username, setUsername] = useState('')
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
	const [showAvatarModal, setShowAvatarModal] = useState(false)
	const [avatarSrc, setAvatarSrc] = useState("https://placehold.co/80x80")
	const [previewSrc, setPreviewSrc] = useState("https://placehold.co/80x80")
	const [usernameMsg, setUsernameMsg] = useState('')
	const [passwordMsg, setPasswordMsg] = useState('')
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const stored = localStorage.getItem('user')
		if (stored) {
			const user = JSON.parse(stored)
			if (user.avatarUrl && user.avatarUrl !== 'default_avatar.png') {
				setAvatarSrc(user.avatarUrl)
				setPreviewSrc(user.avatarUrl)
			}
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
			if (!res.ok) throw new Error('Upload échoué')
			const user = JSON.parse(localStorage.getItem('user'))
			user.avatarUrl = previewSrc
			localStorage.setItem('user', JSON.stringify(user))
			setAvatarSrc(previewSrc)
			setShowAvatarModal(false)
		} catch (err) {
			console.error('Erreur avatar:', err)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		navigate('/')
	}

	// ─── USERNAME ───
	const handleSaveUsername = async () => {
		if (!username.trim()) return setUsernameMsg('Saisis un username.')
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
			setUsernameMsg('Username mis à jour ✓')
			setUsername('')
		} catch (err) {
			setUsernameMsg('Erreur serveur.')
		}
	}

	// ─── MOT DE PASSE ───
	const handleUpdatePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword)
			return setPasswordMsg('Remplis tous les champs.')
		if (newPassword !== confirmPassword)
			return setPasswordMsg('Les mots de passe ne correspondent pas.')
		if (newPassword.length < 6)
			return setPasswordMsg('Le mot de passe doit faire au moins 6 caractères.')

		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ currentPassword, newPassword })
			})
			const data = await res.json()
			if (!res.ok) return setPasswordMsg(data.error)
			setPasswordMsg('Mot de passe mis à jour ✓')
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (err) {
			setPasswordMsg('Erreur serveur.')
		}
	}

	// ─── SUPPRESSION COMPTE ───
	const handleDeleteAccount = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch('/api/user/delete', {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) throw new Error('Erreur suppression')
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			navigate('/')
		} catch (err) {
			console.error('Erreur delete:', err)
		}
	}

	const eyeStyle = {
		position: 'absolute',
		right: '12px',
		background: 'none',
		border: 'none',
		color: '#e7e7e7',
		cursor: 'pointer',
		padding: 0,
		display: 'flex',
		alignItems: 'center'
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
								<p className="settings-danger-desc">Click on the picture to change it</p>
							</div>
						</div>
					</div>

					{/* Section Sécurité */}
					<div className="settings-section">
						<h2 className="settings-section-title">Security & Privacy</h2>

						<div className="settings-item">
							<p className="settings-label">Change password</p>
							<div className="settings-password-form">

								{/* Current password (pas de toggle, inutile) */}
								<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
									<input
										className="settings-input"
										type={showCurrentPassword ? 'text' : 'password'}
										placeholder="Current password..."
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										style={{ paddingRight: '40px', width: '100%' }}
									/>
									<button type="button" style={eyeStyle} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
										{showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
									</button>
								</div>

								{/* New password avec toggle */}
								<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
									<input
										className="settings-input"
										type={showNewPassword ? 'text' : 'password'}
										placeholder="New password..."
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										style={{ paddingRight: '40px', width: '100%' }}
									/>
									<button type="button" style={eyeStyle} onClick={() => setShowNewPassword(!showNewPassword)}>
										{showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
									</button>
								</div>

								{/* Confirm password avec toggle */}
								<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
									<input
										className="settings-input"
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder="Confirm new password..."
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										style={{ paddingRight: '40px', width: '100%' }}
									/>
									<button type="button" style={eyeStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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

			{/* Modal suppression */}
			{showDeleteConfirm && (
				<div className="settings-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">Delete account ?</h3>
						<p className="settings-modal-text">This action is irreversible. Are you sure ?</p>
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
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
		</div>
	)
}

export default SettingsPage