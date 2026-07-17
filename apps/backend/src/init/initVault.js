import { readFile } from 'fs/promises';
import https from 'https';
import axios from 'axios';

const DEFAULT_VAULT_ADDR = 'https://vault:8200';
const DEFAULT_VAULT_CACERT = '/certs/vault.crt';

let vaultClient;

const createHttpsAgent = async () => {
	const caPath = process.env.VAULT_CACERT ?? DEFAULT_VAULT_CACERT;

	try {
        const ca = await readFile(caPath);
        // rejectUnauthorized defaults to true, enforcing strict matching against this CA
        return new https.Agent({ ca });
    } catch (error) {
        throw new Error(`Unable to load Vault CA certificate (${caPath}): ${error.message}`);
    }
};

const getVaultClient = async () => {
	if (vaultClient) return vaultClient;

	try {
		vaultClient = axios.create({
			httpsAgent: await createHttpsAgent(),
			validateStatus: () => true,
		});
	} catch (error) {
		const caPath = process.env.VAULT_CACERT ?? DEFAULT_VAULT_CACERT;
		throw new Error(
			`Unable to load Vault CA certificate (${caPath}): ${error.message}`,
		);
	}

	return vaultClient;
};

/**
 * Récupère les credentials AppRole de Vault.
 * @returns {Promise<{ roleId: string, secretId: string }>}
 */
const getAppRoleCredentials = async () => {
	const credentialsFile =
		process.env.VAULT_APPROLE_FILE ?? '/approle_id/backend-api.json';

	const raw = await readFile(credentialsFile, 'utf8');
	const { role_id, secret_id } = JSON.parse(raw);

	if (!role_id || !secret_id) {
		throw new Error('Invalid AppRole credentials file: role_id and secret_id are required.');
	}

	return { roleId: role_id, secretId: secret_id };
};

/**
 * Authentifie le backend sur Vault via AppRole (HTTPS + vérification du certificat).
 * @returns {Promise<{ token: string, leaseDuration: number, renewable: boolean }>}
 */
const authenticateVault = async () => {
	const vaultAddr = (process.env.VAULT_ADDR || DEFAULT_VAULT_ADDR).replace(/\/$/, '');
	const { roleId, secretId } = await getAppRoleCredentials();
	const client = await getVaultClient();

	const res = await client.post(`${vaultAddr}/v1/auth/approle/login`, {
		role_id: roleId,
		secret_id: secretId,
	});

	const body = res.data;

	if (res.status < 200 || res.status >= 300) {
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

// dans initVault.js — exemple à ajouter
const getVaultSecrets = async (path = 'prod/backend') => {
	// path = 'prod/backend';
	const { token } = await authenticateVault();

	const vaultAddr = (process.env.VAULT_ADDR || 'https://vault:8200').replace(/\/$/, '');
	const client = await getVaultClient();

	const res = await client.get(`${vaultAddr}/v1/secret/data/${path}`, {
		headers: { 'X-Vault-Token': token },
	});

	if (res.status < 200 || res.status >= 300) {
		throw new Error(res.data?.errors?.[0] ?? 'Failed to read Vault secrets');
	}

	return res.data.data.data; // { DB_PASS, JWT_SECRET, GOOGLE_CLIENT_SECRET, ... }
};

const loadEnvFallbackSecrets = () => ({
	DB_PASS: process.env.DB_PASS,
	JWT_SECRET: process.env.JWT_SECRET,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
	MAIL_USER: process.env.MAIL_USER,
	MAIL_PASS: process.env.MAIL_PASS,
	TEST_API_KEY: process.env.TEST_API_KEY,
	ADMIN_API_KEY: process.env.ADMIN_API_KEY,
	REGULAR_USER_PASSWORD: process.env.REGULAR_USER_PASSWORD,
	ADMIN_USER_PASSWORD: process.env.ADMIN_USER_PASSWORD,
});

const hasEnvFallback = () =>
	Boolean(process.env.JWT_SECRET && process.env.DB_PASS);

let vaultSecrets;

try {
	vaultSecrets = await getVaultSecrets();
} catch (error) {
	if (hasEnvFallback()) {
		console.warn(
			`[initVault] Vault unavailable (${error.message}), using .env fallback.`,
		);
		vaultSecrets = loadEnvFallbackSecrets();
	} else {
		throw error;
	}
}

export { vaultSecrets };
