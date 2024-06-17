const Ngo = require('../models/Ngo');
const filterObject = require('../utils/filterObject');

async function verifyNgo(req, res, next) {
	const { secret, id } = req.body;
	if (!secret || secret !== process.env.NGO_SECRET_VERIFY)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid secret.',
		});

	const ngo = await Ngo.findByIdAndUpdate(id, { verified: true });
	if (!ngo)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid ngo.',
		});
	else
		return res.status(200).json({
			status: 'success',
			message: 'Ngo Verified Successfully.',
		});
}
async function deleteNgo(req, res, next) {
	const { secret, id } = req.body;
	if (!secret || secret !== process.env.NGO_SECRET_DELETE)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid secret.',
		});

	const ngo = await Ngo.findByIdAndDelete(id);
	if (!ngo)
		return res.status(401).json({
			status: 'error',
			message: 'Please provide a valid ngo.',
		});
	else
		return res.status(200).json({
			status: 'success',
			message: 'Ngo deleted Successfully.',
		});
}
async function createNgo(req, res, next) {
	try {
		const {
			secret,
			images,
			name,
			namePT,
			location,
		} = req.body;
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

		if (!name || !namePT)
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
				'location',
				'website',
				'cityAndCountry',
				'type',
			);
			const newNgo = await new Ngo(filteredBody);
			await newNgo.save();

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
	} catch (err) {
		console.log(err);
		return res.status(500).json({ status: 'error', message: err.message });
	}
}

async function getAllNgos(req, res, next) {
	const ngos = await Ngo.find({ verified: true }).populate('donations').exec();
	return res.status(200).json({
		status: 'success',
		message: 'Ngos fetched succesfully!',
		ngos,
	});
}
module.exports = { createNgo, getAllNgos, verifyNgo, deleteNgo };
