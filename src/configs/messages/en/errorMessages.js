const authControllerErrors = {
	notLoggedIn: 'Please, log in to perfom this action.',
  userNotVerified: "Please, verify your email before logging in.",
	userNotFound: 'User not found.',
	invalidOTP: 'Email or OTP Is incorrect.',
	nameAndCountryRequired: 'Both full name and country are required.',
	requiredPassword: 'Both password and password confirmation are required.',
	emailAndPasswordsRequired: 'Both email and password are required.',
	incorrectCredentials: 'Email or password is incorrect',
	invalidEmail: 'Please provide a valid email.',
	emailTaken: 'Sorry, this email address has already been taken.',
	noUserWithGivenEmail: 'There is no user with given email address.',
	samePassword: 'Both password and password confirmation needs to be the same.',
	invalidPasswordToken: 'Reset password token is invalid or expired',
	changedPassword:
		'You have recently updated your password! Please, log in again.',
	emailSendingError:
		'Sorry... An error occurred while sending the email. Please try again later.',
	forgotPassword:
		'Sorry... An error occurred while reseting password, please try again.',
	login: 'Sorry... An error occurred while logging in, please try again.',
	logOut: 'Sorry... An error occurred while logging out, please try again.',
	protect:
		'Sorry... An error occurred while checking user access, please try again.',
	register: 'Sorry... An error occurred while registering, please try again.',
	resetPassword:
		'Sorry... An error occurred while reseting password, please try again.',
	sendOTP: 'Sorry... An error occurred while sending OTP, please try again.',
	verifyOTP:
		'Sorry... An error occurred while reseting password, please try again.',
	verifyUser:
		'Sorry... An error occurred while verifying user, please try again.',
};
const donationControllerErrors = {
	createDonation:
		'Sorry... An error occurred while creating donation, please try again.',
};

const ngoControllerErrors = {
	invalidNgo: 'Please provide a valid ngo.',
	invalidSecret: 'Please provide a valid secret.',
	noImage: 'Please provide a valid image.',
	noName: 'Please provide a valid name.',
	noLocation: 'Please provide a valid location.',
	createNgo: 'Sorry... An error occurred while creating NGO, please try again.',
	deleteNgo: 'Sorry... An error occurred while deleting NGO, please try again.',
	getAllNgos:
		'Sorry... An error occurred while getting all NGOS, please try again.',
	nameTaken: 'Sorry... This name has already been taken.',
	verifyNgo:
		'Sorry... An error occurred while verifying NGO, please try again.',
};

const paymentControllerErrors = {
	captureOrder:
		'Sorry... An error occurred while capturing order, please try again.',
	createOrder:
		'Sorry... An error occurred while creating order, please try again.',
};

const phoneNumberControllerErrors = {
	invalidPhoneNumber: 'Please provide a valid phone number.',
	savePhoneNumber:
		'Sorry... An error occurred while saving phone number, please try again.',
};

const userControllerErrors = {
	like: 'Sorry... An error occured while liking, please try again.',
	noImage: 'Please provide an image file.',
	noNgo: 'Please provide a valid NGO array.',
	updateAvatar:
		'Sorry... An error occured while updating avatar, please try again.',
	updateMe:
		'Sorry... An error occured while updating profile, please try again.',
};

module.exports = {
	authControllerErrors,
	authControllerErrors,
	donationControllerErrors,
	ngoControllerErrors,
	paymentControllerErrors,
	phoneNumberControllerErrors,
	userControllerErrors,
};
