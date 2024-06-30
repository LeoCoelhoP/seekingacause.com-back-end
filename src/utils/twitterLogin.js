const axios = require('axios');

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_OAUTH_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_CODE_CHALLANGE = process.env.TWITTER_CODE_CHALLANGE;

const BasicAuthToken = Buffer.from(
	`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`,
	'utf8',
).toString('base64');

const twitterOauthTokenParams = {
	client_id: TWITTER_CLIENT_ID,
	code_verifier: TWITTER_CODE_CHALLANGE,
	redirect_uri: `http://www.localhost/auth/twitter-login`,
	grant_type: 'authorization_code',
};

async function getTwitterOAuthToken(code) {
	try {
		const res = await axios.post(
			TWITTER_OAUTH_TOKEN_URL,
			new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
					Authorization: `Basic ${BasicAuthToken}`,
				},
			},
		);

		return res.data;
	} catch (err) {
		console.error(err);

		return null;
	}
}

async function getTwitterUser(accessToken) {
	try {
		const res = await axios.get('https://api.twitter.com/2/users/me', {
			headers: {
				'Content-type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return res.data.data ?? null;
	} catch (err) {
		console.error(err);
		return null;
	}
}
module.exports = {
	getTwitterOAuthToken,
	getTwitterUser,
	twitterOauthTokenParams,
};
