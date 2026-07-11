import { useTranslation } from 'react-i18next'
import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'
import Footer from '../components/Footer'
import '../styles/LegalPage.css'

const PrivacyPolicyPage = () => {
	const { t } = useTranslation()
	return (
		<div className="legal-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="legal-content">
					<h1 className="legal-title">{t('privacy.title')}</h1>
					<p className="legal-date">{t('privacy.updated')}</p>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s1_title')}</h2>
						<p className="legal-text">{t('privacy.s1_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s2_title')}</h2>
						<p className="legal-text">{t('privacy.s2_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s3_title')}</h2>
						<p className="legal-text">{t('privacy.s3_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s4_title')}</h2>
						<p className="legal-text">{t('privacy.s4_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s5_title')}</h2>
						<p className="legal-text">{t('privacy.s5_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('privacy.s6_title')}</h2>
						<p className="legal-text">{t('privacy.s6_text')}</p>
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default PrivacyPolicyPage