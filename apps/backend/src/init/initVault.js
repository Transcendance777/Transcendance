import { readFile } from 'fs/promises';

const DEFAULT_VAULT_ADDR = 'http://vault:8200';

const getAppRoleCredentials = async () => {
	if (process.env.VAULT_ROLE_ID && process.env.VAULT_SECRET_ID) {
		return {
			roleId: process.env.VAULT_ROLE_ID,
			secretId: process.env.VAULT_SECRET_ID,
		};
	}

	const credentialsFile = process.env.VAULT_APPROLE_FILE;
	if (credentialsFile) {
		const raw = await readFile(credentialsFile, 'utf8');
		const { role_id, secret_id } = JSON.parse(raw);

		if (!role_id || !secret_id) {
			throw new Error('Invalid AppRole credentials file: role_id and secret_id are required.');
		}

		return { roleId: role_id, secretId: secret_id };
	}

	throw new Error(
		'Vault AppRole credentials missing (set VAULT_ROLE_ID/VAULT_SECRET_ID or VAULT_APPROLE_FILE).',
	);
};

/**
 * Authentifie le backend sur Vault via AppRole.
 * @returns {Promise<{ token: string, leaseDuration: number, renewable: boolean }>}
 */
const authenticateVault = async () => {
	const vaultAddr = process.env.VAULT_ADDR || DEFAULT_VAULT_ADDR;
	const { roleId, secretId } = await getAppRoleCredentials();

	const res = await fetch(`${vaultAddr}/v1/auth/approle/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ role_id: roleId, secret_id: secretId }),
	});

	const body = await res.json();

	if (!res.ok) {
		const message = body?.errors?.[0] ?? `Vault AppRole login failed (${res.status})`;
		throw new Error(message);
	}

	const { client_token, lease_duration, renewable } = body.auth ?? {};
	if (!client_token) {
		throw new Error('Vault AppRole login did not return a client token.');
	}

	return {
		token: client_token,
		leaseDuration: lease_duration,
		renewable,
	};
};

export { authenticateVault };
