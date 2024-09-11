const Ngo = require('../models/Ngo');
const filterObject = require('../utils/filterObject');
const {
  ngoControllerSuccesses,
} = require('../configs/messages/en/successMessages');
const {
  ngoControllerSuccessesPT,
} = require('../configs/messages/pt/successMessages');
const { ngoControllerErrors } = require('../configs/messages/en/errorMessages');
const {
  ngoControllerErrorsPT,
} = require('../configs/messages/pt/errorMessages');

function getErrorMessage(errorType, defaultLanguage) {
  return defaultLanguage
    ? ngoControllerErrors[errorType]
    : ngoControllerErrorsPT[errorType];
}

function getSuccessMessage(successType, defaultLanguage) {
  return defaultLanguage
    ? ngoControllerSuccesses[successType]
    : ngoControllerSuccessesPT[successType];
}

function verifySecret(secret, expectedSecret, res, defaultLanguage) {
  if (!secret || secret !== expectedSecret) {
    res.status(401).json({
      status: 'error',
      message: getErrorMessage('invalidSecret', defaultLanguage),
    });
    return false;
  }
  return true;
}

async function verifyNgo(req, res, next) {
  try {
    const { secret, id } = req.body;
    if (
      !verifySecret(
        secret,
        process.env.NGO_SECRET_VERIFY,
        res,
        req.defaultLanguage
      )
    )
      return;

    const ngo = await Ngo.findByIdAndUpdate(id, { verified: true });
    if (!ngo)
      return res.status(401).json({
        status: 'error',
        message: getErrorMessage('invalidNgo', req.defaultLanguage),
      });
    else
      return res.status(200).json({
        status: 'success',
        message: getSuccessMessage('verifyNgo', req.defaultLanguage),
      });
  } catch {
    throw new Error(getErrorMessage('verifyNgo', req.defaultLanguage));
  }
}
async function deleteNgo(req, res, next) {
  try {
    const { secret, id } = req.body;
    if (
      !verifySecret(
        secret,
        process.env.NGO_SECRET_DELETE,
        res,
        req.defaultLanguage
      )
    )
      return;

    const ngo = await Ngo.findByIdAndDelete(id);
    if (!ngo)
      return res.status(401).json({
        status: 'error',
        message: getErrorMessage('invalidNgo', req.defaultLanguage),
      });
    else
      return res.status(200).json({
        status: 'success',
        message: getSuccessMessage('deleteNgo', req.defaultLanguage),
      });
  } catch {
    throw new Error(getErrorMessage('deleteNgo', req.defaultLanguage));
  }
}
async function createNgo(req, res, next) {
  try {
    const { secret, images, name, namePT, location } = req.body;
    if (!verifySecret(secret, process.env.NGO_SECRET, res, req.defaultLanguage))
      return;

    if (!images)
      return res.status(401).json({
        status: 'error',
        message: getErrorMessage('noImage', req.defaultLanguage),
      });

    if (!name || !namePT)
      return res.status(401).json({
        status: 'error',
        message: getErrorMessage('noName', req.defaultLanguage),
      });

    if (!location)
      return res.status(401).json({
        status: 'error',
        message: getErrorMessage('noLocation', req.defaultLanguage),
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
        'type'
      );
      const newNgo = await new Ngo(filteredBody);
      await newNgo.save();

      return res.status(200).json({
        status: 'success',
        message: getSuccessMessage('createNgo', req.defaultLanguage),
        data: newNgo,
      });
    }
    if (existingNgo && existingNgo.verified) {
      return res.status(400).json({
        status: 'error',
        message: getErrorMessage('nameTaken', req.defaultLanguage),
      });
    }
  } catch (err) {
    throw new Error(getErrorMessage('createNgo', req.defaultLanguage));
  }
}

async function getAllNgos(req, res, next) {
  try {
    const ngos = await Ngo.find({ verified: true })
      .populate('donations')
      .exec();

    return res.status(200).json({
      status: 'success',
      message: getSuccessMessage('getAllNgos', req.defaultLanguage),

      ngos,
    });
  } catch (error) {
    console.error(error);
    throw new Error(getErrorMessage('getAllNgos', req.defaultLanguage));
  }
}
module.exports = { createNgo, getAllNgos, verifyNgo, deleteNgo };
