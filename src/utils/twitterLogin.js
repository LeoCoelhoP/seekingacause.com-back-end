const axios = require('axios');

const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_CODE_CHALLANGE } =
	process.env;

const TWITTER_OAUTH_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_REDIRECT_URI = 'http://www.localhost/auth/twitter-login';

const BasicAuthToken = Buffer.from(
	`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`,
	'utf8',
).toString('base64');

const twitterOauthTokenParams = {
	client_id: TWITTER_CLIENT_ID,
	code_verifier: TWITTER_CODE_CHALLANGE,
	redirect_uri: TWITTER_REDIRECT_URI,
	grant_type: 'authorization_code',
};

async function getTwitterOAuthToken(code) {
	try {
		const response = await axios.post(
			TWITTER_OAUTH_TOKEN_URL,
			new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
					Authorization: `Basic ${BasicAuthToken}`,
				},
			},
		);

		return response.data;
	} catch (error) {
		console.error(`Error fetching Twitter OAuth token: ${error.message}`);
		return null;
	}
}

async function getTwitterUser(accessToken) {
	try {
		const response = await axios.get('https://api.twitter.com/2/users/me', {
			headers: {
				'Content-type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return response.data.data ?? null;
	} catch (error) {
		console.error(`Error fetching Twitter user data: ${error.message}`);
		return null;
	}
}

module.exports = {
	getTwitterOAuthToken,
	getTwitterUser,
};
