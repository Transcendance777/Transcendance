import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'
import Footer from '../components/Footer'
import '../styles/LegalPage.css'

const TermsOfServicePage = () => {
	return (
		<div className="legal-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="legal-content">
					<h1 className="legal-title">Terms of Service</h1>
					<p className="legal-date">Last updated: June 2026</p>

					<div className="legal-section">
						<h2 className="legal-subtitle">1. Acceptance of Terms</h2>
						<p className="legal-text">By creating an account on Game REV, you agree to these Terms of Service. If you do not agree, please do not use this service.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">2. Description of Service</h2>
						<p className="legal-text">Game REV is a video game review platform that allows users to discover, rate, and review video games, follow other users, and share their gaming activity.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">3. User Accounts</h2>
						<p className="legal-text">You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. One person may not maintain more than one account.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">4. User Content</h2>
						<p className="legal-text">You retain ownership of the content you post on Game REV (reviews, comments). By posting content, you grant Game REV a non-exclusive license to display that content on the platform. You are solely responsible for the content you post.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">5. Prohibited Conduct</h2>
						<p className="legal-text">You agree not to post offensive, hateful, or illegal content. You agree not to attempt to access other users' accounts or disrupt the service. Violation of these rules may result in account termination.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">6. Termination</h2>
						<p className="legal-text">You may delete your account at any time through the Settings page. Game REV reserves the right to suspend or terminate accounts that violate these terms.</p>
					</div>

					<div className="legal-section">
						<h2 className="legal-subtitle">7. Limitation of Liability</h2>
						<p className="legal-text">Game REV is provided as-is for educational purposes as part of an École 42 project. We are not liable for any damages arising from the use of this service.</p>
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default TermsOfServicePage