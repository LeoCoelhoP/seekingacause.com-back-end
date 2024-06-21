function translator(req, res, next) {
	if (req.headers.language) {
		req.defaultLanguage = req.headers.language === 'US' ? true : false;
	} else req.defaultLanguage = req.headers.language === 'US';
	next();
}

module.exports = { translator };
