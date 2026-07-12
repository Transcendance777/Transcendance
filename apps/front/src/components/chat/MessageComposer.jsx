import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const MessageComposer = ({ onSend, onTypingStart, onTypingStop, disabled }) => {
	const { t } = useTranslation()
	const [body, setBody] = useState('')
	const [sending, setSending] = useState(false)

	const submit = async (event) => {
		event.preventDefault()
		const message = body.trim()
		if (!message || disabled || sending) return

		setSending(true)
		const sent = await onSend(message)
		setSending(false)
		if (sent) {
			setBody('')
			onTypingStop()
		}
	}

	const updateBody = (event) => {
		const value = event.target.value
		setBody(value)
		if (value.trim()) onTypingStart()
		else onTypingStop()
	}

	return (
		<form className="message-composer" onSubmit={submit}>
			<input
				value={body}
				onChange={updateBody}
				onBlur={onTypingStop}
				placeholder={t('chat.message_placeholder')}
				maxLength={2000}
				disabled={disabled}
				aria-label={t('chat.message_placeholder')}
			/>
			<button type="submit" disabled={disabled || sending || !body.trim()} aria-label={t('chat.send')} title={t('chat.send')}>
				<FiSend />
			</button>
		</form>
	)
}

export default MessageComposer
