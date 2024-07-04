const nodemailer = require('nodemailer');
const sendOTPMessages = require('../configs/emailTemplates/sendOTPMessages');
const bcrypt = require('bcryptjs');

function createTransporter() {
	if (
		!process.env.EMAIL_SERVICE ||
		!process.env.EMAIL ||
		!process.env.EMAIL_PASSWORD
	)
		throw new Error(
			'Email service credentials are not properly set in environment variables',
		);

	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	return transporter;
}

function getSubject(type, language) {
	const subjects = {
		verification: {
			en: sendOTPMessages.mailVerificationSubject,
			pt: sendOTPMessages.mailVerificationSubjectPT,
		},
		password: {
			en: sendOTPMessages.mailRecoverSubject,
			pt: sendOTPMessages.mailRecoverSubjectPT,
		},
	};
	return subjects[type] && subjects[type][language];
}

async function sendEmailVerificationOTP(
	user,
	otp,
	type = 'verification',
	language = 'pt',
) {
	try {
		const subject = getSubject(type, language);
		if (!subject) {
			throw new Error('Invalid type or language specified for email subject');
		}

		const transporter = createTransporter();
		const mailOptions = {
			from: `leonardosblog@outlook.com <${process.env.EMAIL}>`,
			to: user.email,
			subject: subject,
			html: sendOTPMessages.html(user, otp, type, language),
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent: ' + info.response);
	} catch (error) {
		console.error('Error sending email:', error);
	}
}

module.exports = { sendEmailVerificationOTP };
