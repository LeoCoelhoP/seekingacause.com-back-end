const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
	images: {
		type: Array,
		default: [],
		required: true,
	},
	name: { type: String, required: true },
	namePT: { type: String, required: true },
	description: { type: String, required: true },
	descriptionPT: { type: String, required: true },
	donations: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Donation' }],
	monthDonations: { type: Array, default: [] },
	location: { type: Array, required: true },
	cityAndCountry: { type: String, required: true },
	reports: { type: Array, default: [] },
	createdAt: {
		type: Date,
	},
	verified: { type: Boolean, default: false },
	type: { type: String, required: true },
	visible: { type: Boolean, default: true },
	website: { type: String },
});

module.exports = new mongoose.model('Ngo', ngoSchema);
