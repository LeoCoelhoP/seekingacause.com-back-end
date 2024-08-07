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
	location: { type: Array, required: true },
	cityAndCountry: { type: String, required: true },
	reports: { type: Array, default: [] },
	verified: { type: Boolean, default: false },
	type: { type: String, required: true },
	visible: { type: Boolean, default: true },
	website: { type: String },
	monthlyGoal: { type: Number, default: 100 },
});

module.exports = new mongoose.model('Ngo', ngoSchema);
