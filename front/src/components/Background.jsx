import '../styles/Background.css'
import '../index.css'

const Background = ({ children, ...rest }) => {
	return (
		<div className="backgroundImage" {...rest}>
			<div className="backgroundOverlay"></div>
			{children}
		</div>
	)
}

export default Background