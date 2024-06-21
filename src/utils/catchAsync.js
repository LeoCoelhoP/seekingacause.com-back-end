function catchAsync(fn) {
	return (req, res, next) => {
		fn(req, res, next).catch((err) =>
			res.status(500).json({ status: 'error', message: err.message }),
		);
	};
}

module.exports = catchAsync;
