const {
	phoneNumberControllerErrors,
} = require('../configs/messages/en/errorMessages');
const {
	phoneNumberControllerSuccesses,
} = require('../configs/messages/en/successMessages');
const {
	phoneNumberControllerSuccessesPT,
} = require('../configs/messages/pt/successMessages');
const PhoneNumber = require('../models/PhoneNumber');
const User = require('../models/User');
const getFilteredUser = require('../utils/getFilteredUser');
const whatsAppMessage = require('../configs/messages/en/whatsappMessage');
const whatsAppMessagePT = require('../configs/messages/pt/whatsappMessage');
// const wbm = require('wbm');

function getErrorMessage(errorType, defaultLanguage) {
	return defaultLanguage
		? phoneNumberControllerErrors[errorType]
		: phoneNumberControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
	return defaultLanguage
		? phoneNumberControllerSuccesses[successType]
		: phoneNumberControllerSuccessesPT[successType];
}

let lastReminder = new Date();

async function savePhoneNumber(req, res) {
	try {
		const { phoneNumber } = req.body;
		console.log(phoneNumber);
		if (!phoneNumber || !Number.isInteger(Number(phoneNumber))) {
			return res.status(400).json({
				status: 'Error',
				message: getErrorMessage('invalidPhoneNumber', req.defaultLanguage),
			});
		}
		const { user } = req;
		if (!user.phoneNumber) {
			const phoneNumberDoc = await new PhoneNumber({
				user: user._id,
				phoneNumber,
			});
			await phoneNumberDoc.save();

			await User.findByIdAndUpdate(user._id, {
				phoneNumber: phoneNumberDoc._id,
			});
		} else
			await PhoneNumber.findByIdAndUpdate(user.phoneNumber, { phoneNumber });

		const filteredUser = await getFilteredUser({ email: user.email });
		res.status(200).json({
			status: 'Success',
			message: getSuccessMessage('savePhoneNumber', req.defaultLanguage),
			user: filteredUser,
		});
	} catch (err) {
		throw new Error(getErrorMessage('savePhoneNumber', req.defaultLanguage));
	}
}

async function sendReminder(req, res) {
	try {
		const { secret } = req.body;
		if (!secret || secret !== process.env.WHATSAPP_REMINDER)
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Reminder Secret',
			});

		const accountSid = process.env.TWILIO_ID;
		const authToken = process.env.TWILIO_TOKEN;
		const client = require('twilio')(accountSid, authToken);

		const date = new Date();
		const reminderMinInterval = 82800000; // 23 Hours
		if (!(date - lastReminder < reminderMinInterval))
			return res.status(400).json({
				status: 'error',
				message: 'Reminder is still in interval.',
			});

		const users = await PhoneNumber.find();
		// users.forEach(async (el) => {
		// 	const { country, fullName } = el.user;
		// 	let message = null;
		// 	if (country === 'BR') {
		// 		message = whatsAppMessagePT(fullName);
		// 	} else message = whatsAppMessage(fullName);

		// 	client.messages
		// 		.create({
		// 			body: message,
		// 			from: '+19803658255',
		// 			to: `+${el.phoneNumber}`,
		// 		})
		// 		.then((message) =>
		// 			console.log(
		// 				`Message sent to: ${el.phoneNumber}, message: ${message.sid}`,
		// 			),
		// 		);
		// });

		// Alternative to TWILLIO
		// await wbm.start({ showBrowser: true, session: false }).then((async) => {
		// 	users.forEach(async (el) => {
		// 		const { country, fullName } = el.user;
		// 		let message = null;
		// 		if (country === 'BR') {
		// 			message = whatsAppMessagePT(fullName);
		// 		} else message = whatsAppMessage(fullName);
		// 		await wbm.sendTo(el.phoneNumber, message);
		// 	});
		// });
		lastReminder = date;
		res.status(200).json({
			status: 'success',
			message: 'Demo Mode: Reminder would be sent if twilio was paied!',
		});
	} catch (err) {
		throw new Error(err.message);
	}
}

module.exports = { savePhoneNumber, sendReminder };
