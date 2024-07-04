function translator(req, res, next) {
	if (req.headers.language) {
		req.defaultLanguage = req.headers.language === 'US';
	} else req.defaultLanguage = false;
	next();
}

module.exports = translator;
