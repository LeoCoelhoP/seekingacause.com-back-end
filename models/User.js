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
		type: Number,
	},
	otpExpiryTime: {
		type: Date,
	},
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('otp')) return next();

	this.otp = await bcrypt.hash(this.otp, 12);

	next();
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	next;
});

userSchema.methods.correctPassword = async function (
	canditatePassword,
	userPassword,
) {
	return await bcrypt.compare(canditatePassword, userPassword);
};

userSchema.methods.correctOTP = async function (canditateOTP, userOTP) {
	return await bcrypt.compare(canditateOTP, userOTP);
};

userSchema.methods.createPasswordResetToken = async function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 10000; // 10 Minutes
	return resetToken;
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
	return timestamp < this.passwordChangedAt;
};

const User = new mongoose.model('User', userSchema);
module.exports = User;
