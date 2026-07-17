import { useTranslation } from 'react-i18next'
import Background from '../components/Background'
import HomeNavBar from '../components/HomeNavBar'
import Footer from '../components/Footer'
import styles from '../styles/LegalPage.module.css'

const PrivacyPolicyPage = () => {
	const { t } = useTranslation()
	return (
		<div className={styles.page}>
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className={styles.content}>
					<h1 className={styles.title}>{t('privacy.title')}</h1>
					<p className={styles.date}>{t('privacy.updated')}</p>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s1_title')}</h2>
						<p className={styles.text}>{t('privacy.s1_text')}</p>
					</div>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s2_title')}</h2>
						<p className={styles.text}>{t('privacy.s2_text')}</p>
					</div>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s3_title')}</h2>
						<p className={styles.text}>{t('privacy.s3_text')}</p>
					</div>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s4_title')}</h2>
						<p className={styles.text}>{t('privacy.s4_text')}</p>
					</div>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s5_title')}</h2>
						<p className={styles.text}>{t('privacy.s5_text')}</p>
					</div>
					<div className={styles.section}>
						<h2 className={styles.subtitle}>{t('privacy.s6_title')}</h2>
						<p className={styles.text}>{t('privacy.s6_text')}</p>
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default PrivacyPolicyPage
