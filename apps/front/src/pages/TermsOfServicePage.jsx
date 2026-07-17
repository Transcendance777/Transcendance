import { useTranslation } from 'react-i18next'
import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'
import Footer from '../components/Footer'
import '../styles/LegalPage.css'

const TermsOfServicePage = () => {
	const { t } = useTranslation()
	return (
		<div className="legal-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="legal-content">
					<h1 className="legal-title">{t('terms.title')}</h1>
					<p className="legal-date">{t('terms.updated')}</p>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s1_title')}</h2>
						<p className="legal-text">{t('terms.s1_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s2_title')}</h2>
						<p className="legal-text">{t('terms.s2_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s3_title')}</h2>
						<p className="legal-text">{t('terms.s3_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s4_title')}</h2>
						<p className="legal-text">{t('terms.s4_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s5_title')}</h2>
						<p className="legal-text">{t('terms.s5_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s6_title')}</h2>
						<p className="legal-text">{t('terms.s6_text')}</p>
					</div>
					<div className="legal-section">
						<h2 className="legal-subtitle">{t('terms.s7_title')}</h2>
						<p className="legal-text">{t('terms.s7_text')}</p>
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default TermsOfServicePage