const nodemailer = require('nodemailer');
const sendOTPMessages = require('../constants/sendOTPMessages');
const bcrypt = require('bcryptjs');

function createTransporter() {
	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	return transporter;
}

async function sendEmailVerificationOTP(
	user,
	otp,
	type = 'verification',
	language = 'pt',
) {

	try {
		console.log(language);
		let subject = null;
		if (type === 'verification' && language === 'en')
			subject = sendOTPMessages.mailVerificationSubject;

		if (type === 'verification' && language === 'pt')
			subject = sendOTPMessages.mailVerificationSubjectPT;

		if (type === 'password' && language === 'en')
			subject = sendOTPMessages.mailRecoverSubject;

		if (type === 'password' && language === 'pt')
			subject = sendOTPMessages.mailRecoverSubjectPT;

		const transporter = createTransporter();
		const mailOptions = {
			from: `leonardosblog@outlook.com <${process.env.EMAIL}>`,
			to: user.email,
			subject: subject,
			html: sendOTPMessages.html(user, otp, type, language),
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) return console.error(error);
		});
	} catch (error) {
		console.error(error);
	}
}

module.exports = { sendEmailVerificationOTP };
