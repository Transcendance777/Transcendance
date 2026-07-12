const MessageBubble = ({ message, own, locale }) => (
	<div className={`message-row ${own ? 'own' : ''}`}>
		<div className="message-bubble">
			<p>{message.body}</p>
			<time>{new Date(message.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</time>
		</div>
	</div>
)

export default MessageBubble
