import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'
import Footer from '../components/Footer'
import '../styles/LegalPage.css'

const PrivacyPolicyPage = () => {
	return (
		<div className="legal-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="legal-content">
					<h1 className="legal-title">Privacy Policy</h1>
					<p className="legal-date">Last updated: June 2026</p>

					<div className="legal-section">
						<h2 className="legal-subtitle">1. Data We Collect</h2>
						<p className="legal-text">When you create an account on Game REV, we collect the following information: your email address, username, and profile picture. If you sign in with Google, we receive your public Google profile information.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">2. How We Use Your Data</h2>
						<p className="legal-text">Your data is used solely to provide and improve the Game REV service. We use your email to identify your account, your username to display your public profile, and your activity data (reviews, likes, playing list) to personalize your experience.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">3. Data Storage</h2>
						<p className="legal-text">Your data is stored securely in our database. Passwords are hashed using bcrypt and are never stored in plain text. We do not sell or share your personal data with third parties.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">4. Cookies</h2>
						<p className="legal-text">Game REV uses authentication tokens stored in your browser's local storage to keep you logged in. No tracking cookies are used.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">5. Your Rights</h2>
						<p className="legal-text">You have the right to access, modify, or delete your personal data at any time through your account settings. You can permanently delete your account and all associated data from the Settings page.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">6. Contact</h2>
						<p className="legal-text">For any questions regarding your privacy, you can contact the Game REV team through the École 42 platform.</p>
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default PrivacyPolicyPage