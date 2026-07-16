export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 128
export const MIN_USERNAME_LENGTH = 4
export const MAX_USERNAME_LENGTH = 8
export const MAX_SEARCH_QUERY_LENGTH = 100
export const MAX_REVIEW_TEXT_LENGTH = 500
export const MAX_COMMENT_TEXT_LENGTH = 200
export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_EMAIL_DOMAINS = [
	'gmail.com',
	'hotmail.com',
	'yahoo.com',
	'outlook.com',
	'yahoo.fr',
	'hotmail.fr',
]
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const RESET_CODE_REGEX = /^\d{6}$/

const trimRequired = (value) => {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed === '' ? null : trimmed
}

const validateEmail = (email) => {
	const trimmed = trimRequired(email)
	if (!trimmed) return { ok: false, errorKey: 'validation.all_fields' }
	if (trimmed.length > 254) return { ok: false, errorKey: 'validation.email_too_long' }
	if (!EMAIL_REGEX.test(trimmed)) return { ok: false, errorKey: 'login.err_email_domain' }
	const domain = trimmed.split('@')[1]?.toLowerCase()
	if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
		return { ok: false, errorKey: 'login.err_email_domain' }
	}
	return { ok: true, value: trimmed.toLowerCase() }
}

const validateUsername = (username) => {
	const trimmed = trimRequired(username)
	if (!trimmed) return { ok: false, errorKey: 'validation.username_required' }
	if (trimmed.length < MIN_USERNAME_LENGTH || trimmed.length > MAX_USERNAME_LENGTH) {
		return { ok: false, errorKey: 'validation.username_length' }
	}
	if (!USERNAME_REGEX.test(trimmed)) {
		return { ok: false, errorKey: 'validation.username_chars' }
	}
	return { ok: true, value: trimmed }
}

const validateCredentialPassword = (password, { requiredKey = 'validation.all_fields' } = {}) => {
	if (typeof password !== 'string' || password.length === 0) {
		return { ok: false, errorKey: requiredKey }
	}
	if (password.length > MAX_PASSWORD_LENGTH) {
		return { ok: false, errorKey: 'validation.password_too_long' }
	}
	return { ok: true, value: password }
}

const validatePassword = (password, { requiredKey = 'validation.all_fields' } = {}) => {
	const credential = validateCredentialPassword(password, { requiredKey })
	if (!credential.ok) return credential
	if (password.length < MIN_PASSWORD_LENGTH) {
		return { ok: false, errorKey: 'login.err_password_length' }
	}
	return { ok: true, value: password }
}

const validateLoginIdentifier = (identifier) => {
	const trimmed = trimRequired(identifier)
	if (!trimmed) return { ok: false, errorKey: 'login.err_identifier_required' }
	if (trimmed.length > 254) return { ok: false, errorKey: 'validation.identifier_too_long' }
	return { ok: true, value: trimmed }
}

const validateResetCode = (code) => {
	if (typeof code !== 'string' || !RESET_CODE_REGEX.test(code.trim())) {
		return { ok: false, errorKey: 'validation.invalid_code' }
	}
	return { ok: true, value: code.trim() }
}

const validateSearchQuery = (q) => {
	const trimmed = trimRequired(q)
	if (!trimmed) return { ok: false, errorKey: 'validation.search_empty' }
	if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
		return { ok: false, errorKey: 'validation.search_too_long' }
	}
	return { ok: true, value: trimmed }
}

const validateInternalRating = (rating) => {
	const num = Number(rating)
	if (!Number.isFinite(num) || num < 0.5 || num > 5) {
		return { ok: false, errorKey: 'validation.invalid_rating' }
	}
	const halfSteps = num * 2
	if (!Number.isInteger(halfSteps) || halfSteps < 1 || halfSteps > 10) {
		return { ok: false, errorKey: 'validation.invalid_rating' }
	}
	return { ok: true, value: num }
}

const validateReviewText = (text) => {
	if (text === undefined || text === null || text === '') {
		return { ok: true, value: '' }
	}
	if (typeof text !== 'string') return { ok: false, errorKey: 'validation.invalid_text' }
	if (text.length > MAX_REVIEW_TEXT_LENGTH) {
		return { ok: false, errorKey: 'validation.review_too_long' }
	}
	return { ok: true, value: text.trim() }
}

const validateCommentText = (text) => {
	if (typeof text !== 'string' || text.trim() === '') {
		return { ok: false, errorKey: 'validation.comment_empty' }
	}
	if (text.length > MAX_COMMENT_TEXT_LENGTH) {
		return { ok: false, errorKey: 'validation.comment_too_long' }
	}
	return { ok: true, value: text.trim() }
}

const validateAvatarFile = (file) => {
	if (!file) return { ok: false, errorKey: 'validation.avatar_required' }
	if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
		return { ok: false, errorKey: 'validation.avatar_invalid_type' }
	}
	if (file.size > MAX_AVATAR_FILE_SIZE) {
		return { ok: false, errorKey: 'validation.avatar_too_large' }
	}
	return { ok: true, value: file }
}

const validatePasswordMatch = (password1, password2) => {
	if (password1 !== password2) {
		return { ok: false, errorKey: 'login.passwords_match' }
	}
	return { ok: true }
}

export {
	validateAvatarFile,
	validateCommentText,
	validateCredentialPassword,
	validateEmail,
	validateInternalRating,
	validateLoginIdentifier,
	validatePassword,
	validatePasswordMatch,
	validateResetCode,
	validateReviewText,
	validateSearchQuery,
	validateUsername,
}
