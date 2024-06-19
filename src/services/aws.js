const crypto = require('crypto');
const sharp = require('sharp');
const dotenv = require('dotenv').config();
const User = require('../models/User');

const {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const awsBucketName = process.env.AWS_BUCKET_NAME;
const awsBucketRegion = process.env.AWS_BUCKET_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
	credentials: {
		accessKeyId: awsAccessKeyId,
		secretAccessKey: awsSecretAccessKey,
	},
	region: awsBucketRegion,
});

function randomImageName(bytes = 32) {
	return crypto.randomBytes(bytes).toString('hex');
}

async function updateAvatar(file, oldAvatar) {
	const buffer = await sharp(file.buffer)
		.resize({
			height: 1280,
			width: 720,
			fit: 'cover',
		})
		.toBuffer();

	const imageName = randomImageName();
	const putObjectParams = {
		Bucket: awsBucketName,
		Key: imageName,
		Body: buffer,
		ContentType: file.mimetype,
	};

	try {
		if (oldAvatar.imageName) {
			const deleteParams = {
				Bucket: awsBucketName,
				Key: oldAvatar.imageName,
			};

			const deleteCommand = new DeleteObjectCommand(deleteParams);
			await s3.send(deleteCommand);
		}

		const command = new PutObjectCommand(putObjectParams);
		await s3.send(command);

		const getObjectParams = {
			Bucket: awsBucketName,
			Key: imageName,
		};

		const getUrlCommand = new GetObjectCommand(getObjectParams);
		const url = await getSignedUrl(s3, getUrlCommand);
		return [url, imageName];
	} catch (error) {
		console.log(error);
	}
}

module.exports = { updateAvatar };
