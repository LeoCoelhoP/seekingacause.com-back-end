const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
	avatar: {
		type: String,
	},
	fullName: { type: String, required: true },
	email: {
		type: String,
		required: [true, 'Email is required.'],
		validate: function (email) {
			return String(email)
				.toLocaleLowerCase()
				.match(
					/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				);
		},
		message: 'Please, insert a valid email address.',
	},
	country: { type: String },
	password: {
		type: String,
		required: true,
	},
	passwordConfirmation: {
		type: String,
	},
	phoneNumber: { type: String },
	showPhoneNumber: { type: Boolean },
	totalDonated: { type: Number, default: 0 },
	adsDonated: { type: Number, default: 0 },
	level: { type: Number, default: 0 },
	likes: [{ type: mongoose.Schema.Types.ObjectId }],
	passwordChangedAt: {
		type: Date,
	},
	passwordResetToken: {
		type: String,
	},
	passwordResetExpires: {
		type: Date,
	},
	createdAt: {
		type: Date,
	},
	updatedAt: {
		type: Date,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	otp: {
		type: String,
	},
	otpExpiryTime: {
		type: Date,
	},
});
userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('otp') || !this.otp) return next();
	const hashedOTP = await bcrypt.hashSync(this.otp.toString(), 12);
	this.otp = hashedOTP;

	next();
});

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password') || !this.password) return next();
	// Hash the password with cost of 12
	const hashedPassword = await bcrypt.hash(this.password, 12);
	this.password = hashedPassword;
	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.correctOTP = async function (candidateOTP, userOTP) {
	return await bcrypt.compare(candidateOTP, userOTP);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10,
		);
		return JWTTimeStamp < changedTimeStamp;
	}

	// FALSE MEANS NOT CHANGED
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = new mongoose.model('User', userSchema);
module.exports = User;
