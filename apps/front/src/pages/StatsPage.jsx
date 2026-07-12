import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import Footer from '../components/Footer'
import PlayingListStatsChart from '../components/PlayingListStatsChart'
import RatingDistributionChart from '../components/RatingDistributionChart'
import GameGenreDistributionChart from '../components/GameGenreDistributionChart'
import '../styles/ProfilePage.css'
import '../styles/StatsPage.css'

const StatsPage = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) navigate('/')
	}, [navigate])

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: 'flex-start' }}>
				<div className="profile-content">
					<h2 className="profile-section-title">{t('profile.stats')}</h2>
					<div className="stats-charts">
						<PlayingListStatsChart />
						<RatingDistributionChart />
						<GameGenreDistributionChart />
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default StatsPage
