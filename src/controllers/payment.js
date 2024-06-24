const dotenv = require('dotenv');
const Donation = require('../models/Donation');
const getFilteredUser = require('../utils/getFilteredUser');
const Ngo = require('../models/Ngo');
const {
	paymentControllerErrors,
} = require('../configs/messages/en/errorMessages');
const {
	paymentControllerSuccesses,
} = require('../configs/messages/en/successMessages');
const {
	paymentControllerErrorsPT,
} = require('../configs/messages/pt/errorMessages');
const {
	paymentControllerSuccessesPT,
} = require('../configs/messages/pt/successMessages');
dotenv.config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = 'https://api-m.sandbox.paypal.com';

function getErrorMessage(errorType, defaultLanguage) {
	return defaultLanguage
		? paymentControllerErrors[errorType]
		: paymentControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
	return defaultLanguage
		? paymentControllerSuccesses[successType]
		: paymentControllerSuccessesPT[successType];
}

async function generateAccessToken() {
	try {
		if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
			throw new Error('MISSING_API_CREDENTIALS');
		}
		const auth = Buffer.from(
			PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET,
		).toString('base64');
		const response = await fetch(`${base}/v1/oauth2/token`, {
			method: 'POST',
			body: 'grant_type=client_credentials',
			headers: {
				Authorization: `Basic ${auth}`,
			},
		});

		const data = await response.json();
		return data.access_token;
	} catch (error) {
		console.error('Failed to generate Access Token:', error);
	}
}

async function handleResponse(response) {
	try {
		const jsonResponse = await response.json();
		return {
			jsonResponse,
			httpStatusCode: response.status,
		};
	} catch (err) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}
}

async function createOrderHelper(cart) {
	console.log(
		'shopping cart information passed from the frontend createOrder() callback:',
		cart,
	);

	const accessToken = await generateAccessToken();
	const url = `${base}/v2/checkout/orders`;

	const { currency, cost } = cart.cart;
	const payload = {
		intent: 'CAPTURE',
		purchase_units: [
			{
				amount: {
					currency_code: currency,
					value: cost,
				},
			},
		],
	};

	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
			// Uncomment one of these to force an error for negative testing (in sandbox mode only).
			// Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
			// "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
			// "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
			// "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
		},
		method: 'POST',
		body: JSON.stringify(payload),
	});

	return handleResponse(response);
}

async function createOrder(req, res) {
	try {
		// use the cart information passed from the front-end to calculate the order amount detals
		const { jsonResponse, httpStatusCode } = await createOrderHelper(req.body);
		const { user, cart } = req.body;
		const donation = new Donation({
			ngo: cart.ngoId,
			type: 'money',
			orderID: jsonResponse.id,
			amount: cart.cost,
			user: user?.id || undefined,
		});
		await donation.save();
		return res.status(httpStatusCode).json(jsonResponse);
	} catch (error) {
		throw new Error(getErrorMessage('createOrder', req.defaultLanguage));
	}
}

async function captureOrderHelper(orderID) {
	const accessToken = await generateAccessToken();
	const url = `${base}/v2/checkout/orders/${orderID}/capture`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const donation = await Donation.findOne({ orderID });
	donation.paid = true;
	await donation.save();
	return handleResponse(response);
}

async function captueOrder(req, res) {
	try {
		const { orderID, user } = req.body;
		const { jsonResponse, httpStatusCode } = await captureOrderHelper(orderID);
		const filteredUser = await getFilteredUser({ _id: user._id });
		const ngos = await Ngo.find();
		res.status(httpStatusCode).json({
			message: getSuccessMessage('captureOrder', req.defaultLanguage),
			data: jsonResponse,
			user: filteredUser || null,
			ngos,
		});
	} catch {
		throw new Error(getErrorMessage('captureOrder', req.defaultLanguage));
	}
}

module.exports = { createOrder, captueOrder };
