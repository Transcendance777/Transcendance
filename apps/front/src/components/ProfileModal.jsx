import '../styles/ProfileModal.css'

const ProfileModal = ({ title, children, onClose }) => {
	return (
		<div className="profile-modal-overlay" onClick={onClose}>
			<div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="profile-modal-header">
					<h2 className="profile-modal-title">{title}</h2>
					<button className="profile-modal-close" onClick={onClose}>✕</button>
				</div>
				<div className="profile-modal-body">
					{children}
				</div>
			</div>
		</div>
	)
}

export default ProfileModal