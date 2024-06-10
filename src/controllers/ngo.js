const Ngo = require('../models/Ngo');
const filterObject = require('../utils/filterObject');
async function createNgo(req, res, next) {
	const { secret, images, name, description, location } = req.body;
	if (!secret || secret !== process.env.NGO_SECRET)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid secret.',
		});

	if (!images)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid image.',
		});

	if (!name)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid name.',
		});

	if (!location)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid location.',
		});

	const existingNgo = await Ngo.findOne({ name: req.body.name });
	if (!existingNgo) {
		const filteredBody = filterObject(
			req.body,
			'images',
			'name',
			'namePT',
			'description',
			'descriptionPT',
			'donations',
			'monthDonations',
			'location',
			'reports',
			'cityAndCountry',
		);
		const newNgo = await new Ngo(filteredBody);
		await newNgo.save();
		// Todo create email verificaition
		return res.status(200).json({
			status: 'success',
			message: 'Ngo create successfully, please verify it.',
			data: newNgo,
		});
	}
	if (existingNgo && existingNgo.verified) {
		return res.status(400).json({
			status: 'error',
			message: 'Sorry, this email address has already been taken.',
		});
	}
}

async function getAllNgos(req, res, next) {
	const ngos = await Ngo.find().populate('donations').exec();
	return res.status(200).json({
		status: 'success',
		message: 'Ngos fetched succesfully!',
		ngos,
	});
}
module.exports = { createNgo, getAllNgos };
