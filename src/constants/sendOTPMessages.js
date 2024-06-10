const passwordRecoveryTemplates = require('./passwordRecoveryTemplates');
const emailVerificationTemplates = require('./emailVerificationTemplates');

const sendOTPMessages = {
	error: `Some error occured while sending register email verification.`,
	success: `Email successfully sent! Please verify it to end the registering process.`,
	mailFrom: process.env.EMAIL,
	mailVerificationSubject: `Verify Your Account - SeekingACause.com`,
	mailVerificationSubjectPT: `Verifique Sua Conta - SeekingACause.com`,
	mailRecoverSubject: `Password Recovery - SeekingACause.com`,
	mailRecoverSubjectPT: `Recuperação de Senha - SeekingACause.com`,

	html(user, otp, type, language) {
		if (type === 'verification' && language === 'en')
			return emailVerificationTemplates.en(user, otp);

		if (type === 'verification' && language === 'pt')
			return emailVerificationTemplates.pt(user, otp);

		if (type === 'password' && language === 'en')
			return passwordRecoveryTemplates.en(user, otp);

		if (type === 'password' && language === 'pt')
			return passwordRecoveryTemplates.pt(user, otp);
	},
};

module.exports = sendOTPMessages;
