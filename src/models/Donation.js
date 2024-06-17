const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
	user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
	ngo: { type: mongoose.SchemaTypes.ObjectId, ref: 'Ngo', required: true },
	type: { type: String, default: 'ads', required: true },
	amount: { type: Number },
	iat: { type: Date, default: Date.now },
	paid: {
		type: Boolean,
		default: false,
	},
	orderID: { type: String },
});

function autoPopulateChildren(next) {
	this.populate('user', 'fullName level avatar country -_id');
	next();
}

donationSchema.pre('find', autoPopulateChildren);

module.exports = new mongoose.model('Donation', donationSchema);
