import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import Footer from '../components/Footer'
import PlayingListStatsChart from '../components/PlayingListStatsChart'
import RatingDistributionChart from '../components/RatingDistributionChart'
import GameGenreDistributionChart from '../components/GameGenreDistributionChart'
import StatsFilters from '../components/StatsFilters'
import { DEFAULT_STATS_PERIOD } from '../components/statsUtils'
import '../styles/ProfilePage.css'
import '../styles/StatsPage.css'

const StatsPage = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [period, setPeriod] = useState(DEFAULT_STATS_PERIOD)
	const [fromYear, setFromYear] = useState(null)
	const [toYear, setToYear] = useState(null)

	const statsFilter = useMemo(
		() => ({ period, fromYear, toYear }),
		[period, fromYear, toYear],
	)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) navigate('/')
	}, [navigate])

	const handlePeriodChange = (nextPeriod) => {
		setPeriod(nextPeriod)
		setFromYear(null)
		setToYear(null)
	}

	const handleYearRangeChange = (nextFromYear, nextToYear) => {
		setFromYear(nextFromYear)
		setToYear(nextToYear)
	}

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: 'flex-start' }}>
				<div className="profile-content">
					<h2 className="profile-section-title">{t('profile.stats')}</h2>
					<div className="stats-charts">
						<StatsFilters
							period={period}
							fromYear={fromYear}
							toYear={toYear}
							onPeriodChange={handlePeriodChange}
							onYearRangeChange={handleYearRangeChange}
						/>
						<PlayingListStatsChart statsFilter={statsFilter} />
						<RatingDistributionChart statsFilter={statsFilter} />
						<GameGenreDistributionChart statsFilter={statsFilter} />
					</div>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default StatsPage
