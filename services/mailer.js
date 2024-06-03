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

async function sendEmailVerificationOTP(user, otp) {
	try {
		const transporter = createTransporter();
		const mailOptions = {
			from: `leonardosblog@outlook.com <${process.env.EMAIL}>`,
			to: user.email,
			subject: sendOTPMessages.mailSubject,
			html: sendOTPMessages.html(user, otp),
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) console.error(error);
		});
	} catch (error) {
		console.error(error);
	}
}

module.exports = { sendEmailVerificationOTP };
