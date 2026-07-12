import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildStatsExportUrl } from './statsUtils'

const StatsExportButton = ({ statsFilter }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleExport = async () => {
		const token = localStorage.getItem('token')
		if (!token) return

		try {
			setLoading(true)
			setError(null)

			const res = await fetch(buildStatsExportUrl(statsFilter), {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error('export_failed')

			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = 'stats-export.pdf'
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		} catch {
			setError(t('stats.export_error'))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="stats-export">
			<button
				type="button"
				className="stats-export-btn"
				onClick={handleExport}
				disabled={loading}
			>
				{loading ? t('stats.export_loading') : t('stats.export')}
			</button>
			{error && <p className="stats-export-error">{error}</p>}
		</div>
	)
}

export default StatsExportButton
