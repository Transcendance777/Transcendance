import { Link } from 'react-router-dom'
import '../styles/Footer.css'

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-left">
				<img src="/faviconGameRev.svg" alt="Game Rev" className="footer-logo" />
				<p className="footer-credits">Made by Mario, Daniya, Ugo, Yasser & Rydom · École 42</p>
			</div>
			<div className="footer-right">
				<Link to="/privacy" className="footer-link">Privacy Policy</Link>
				<Link to="/terms" className="footer-link">Terms of Service</Link>
			</div>
		</footer>
	)
}

export default Footer