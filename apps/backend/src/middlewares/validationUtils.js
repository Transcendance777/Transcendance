import sanitizeHtml from 'sanitize-html';

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;
const MAX_SEARCH_QUERY_LENGTH = 100;
const MAX_REVIEW_TEXT_LENGTH = 500;
const MAX_COMMENT_TEXT_LENGTH = 200;
const MAX_AVATAR_SIZE = 3_000_000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EMAIL_DOMAINS = [
	'gmail.com',
	'hotmail.com',
	'yahoo.com',
	'outlook.com',
	'yahoo.fr',
	'hotmail.fr',
];
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const RESET_CODE_REGEX = /^\d{6}$/;

const SANITIZE_OPTIONS = {
	allowedTags: ['b', 'i', 'em', 'strong'],
	allowedAttributes: {},
};

const trimRequired = (value) => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
};

const parsePositiveIntParam = (value) => {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isInteger(parsed) || parsed < 1) return null;
	return parsed;
};

const parseExternalGameId = (value) => {
	if (value === undefined || value === null || value === '') return null;
	const str = String(value).trim();
	if (!/^\d+$/.test(str) || str === '0') return null;
	return str;
};

const validateEmail = (email) => {
	const trimmed = trimRequired(email);
	if (!trimmed) return { ok: false, error: 'All fields are required.' };
	if (trimmed.length > 254) return { ok: false, error: 'Email is too long.' };
	if (!EMAIL_REGEX.test(trimmed)) {
		return { ok: false, error: 'Please use a valid email address (Gmail, Hotmail, Yahoo or Outlook).' };
	}
	const domain = trimmed.split('@')[1]?.toLowerCase();
	if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
		return { ok: false, error: 'Please use a valid email address (Gmail, Hotmail, Yahoo or Outlook).' };
	}
	return { ok: true, value: trimmed.toLowerCase() };
};

const validateUsername = (username) => {
	const trimmed = trimRequired(username);
	if (!trimmed) return { ok: false, error: 'Invalid username.' };
	if (trimmed.length < MIN_USERNAME_LENGTH || trimmed.length > MAX_USERNAME_LENGTH) {
		return { ok: false, error: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.` };
	}
	if (!USERNAME_REGEX.test(trimmed)) {
		return { ok: false, error: 'Username may only contain letters, numbers, and underscores.' };
	}
	return { ok: true, value: trimmed };
};

const validateCredentialPassword = (password, { requiredError = 'Email/username and password required.' } = {}) => {
	if (typeof password !== 'string' || password.length === 0) {
		return { ok: false, error: requiredError };
	}
	if (password.length > MAX_PASSWORD_LENGTH) {
		return { ok: false, error: 'Password is too long.' };
	}
	return { ok: true, value: password };
};

const validatePassword = (password, { requiredError = 'All fields are required.' } = {}) => {
	if (typeof password !== 'string' || password.length === 0) {
		return { ok: false, error: requiredError };
	}
	if (password.length < MIN_PASSWORD_LENGTH) {
		return { ok: false, error: 'Password must be at least 6 characters.' };
	}
	if (password.length > MAX_PASSWORD_LENGTH) {
		return { ok: false, error: 'Password is too long.' };
	}
	return { ok: true, value: password };
};

const validateLoginIdentifier = (identifier) => {
	const trimmed = trimRequired(identifier);
	if (!trimmed) return { ok: false, error: 'Email/username and password required.' };
	if (trimmed.length > 254) return { ok: false, error: 'Identifier is too long.' };
	return { ok: true, value: trimmed };
};

const validateResetCode = (code) => {
	if (typeof code !== 'string' || !RESET_CODE_REGEX.test(code.trim())) {
		return { ok: false, error: 'Invalid verification code.' };
	}
	return { ok: true, value: code.trim() };
};

const validateSearchQuery = (q, { maxLength = MAX_SEARCH_QUERY_LENGTH, emptyError = 'Empty query.' } = {}) => {
	const trimmed = trimRequired(q);
	if (!trimmed) return { ok: false, error: emptyError };
	if (trimmed.length > maxLength) {
		return { ok: false, error: `Search query must not exceed ${maxLength} characters.` };
	}
	return { ok: true, value: trimmed };
};

const validateInternalRating = (rating) => {
	const num = Number(rating);
	if (!Number.isFinite(num) || num < 0.5 || num > 5) {
		return { ok: false, error: 'Invalid rating (0.5 to 5).' };
	}
	const halfSteps = num * 2;
	if (!Number.isInteger(halfSteps) || halfSteps < 1 || halfSteps > 10) {
		return { ok: false, error: 'Rating must be in 0.5 increments between 0.5 and 5.' };
	}
	return { ok: true, value: num };
};

const sanitizeUserText = (text, maxLength) => {
	if (text === undefined || text === null || text === '') {
		return { ok: true, value: null };
	}
	if (typeof text !== 'string') {
		return { ok: false, error: 'Text must be a string.' };
	}
	const trimmed = text.trim();
	if (trimmed === '') {
		return { ok: true, value: null };
	}
	if (trimmed.length > maxLength) {
		return { ok: false, error: `Text must not exceed ${maxLength} characters.` };
	}
	const safe = sanitizeHtml(trimmed, SANITIZE_OPTIONS);
	return { ok: true, value: safe };
};

const validateAvatar = (avatar) => {
	if (!avatar || typeof avatar !== 'string') {
		return { ok: false, error: 'No image provided.' };
	}
	if (avatar.length > MAX_AVATAR_SIZE) {
		return { ok: false, error: 'Image too large (max ~2MB).' };
	}
	if (!avatar.startsWith('data:image/') || !avatar.includes(';base64,')) {
		return { ok: false, error: 'Invalid image format.' };
	}
	return { ok: true, value: avatar };
};

export {
	MAX_COMMENT_TEXT_LENGTH,
	MAX_REVIEW_TEXT_LENGTH,
	parseExternalGameId,
	parsePositiveIntParam,
	sanitizeUserText,
	validateAvatar,
	validateCredentialPassword,
	validateEmail,
	validateInternalRating,
	validateLoginIdentifier,
	validatePassword,
	validateResetCode,
	validateSearchQuery,
	validateUsername,
};
