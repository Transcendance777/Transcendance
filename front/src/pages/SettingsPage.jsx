import { useState } from 'react'
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

	const handleAvatarChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewSrc(url)
		}
	}

	const handleSaveAvatar = () => {
		setAvatarSrc(previewSrc)
		setShowAvatarModal(false)
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
								<button className="settings-save-btn">Save</button>
							</div>
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
								<input
									className="settings-input"
									type="password"
									placeholder="Current password..."
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
								/>
								<input
									className="settings-input"
									type="password"
									placeholder="New password..."
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
								<input
									className="settings-input"
									type="password"
									placeholder="Confirm new password..."
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
								<button className="settings-save-btn">Update password</button>
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
							<button className="settings-confirm-danger-btn">Log out</button>
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
							<button className="settings-confirm-danger-btn">Delete</button>
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