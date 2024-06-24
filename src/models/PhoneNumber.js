const mongoose = require('mongoose');

const phoneNumber = new mongoose.Schema({
	user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
	phoneNumber: { type: Number },
});

function autoPopulateChildren(next) {
	this.populate('user', 'fullName level avatar country -_id');
	next();
}

phoneNumber.pre('find', autoPopulateChildren);

module.exports = new mongoose.model('PhoneNumber', phoneNumber);
