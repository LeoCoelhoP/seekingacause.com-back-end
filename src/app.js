const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const { translator } = require('./utils/translator');

const app = express();
app.use(
	express.urlencoded({
		extended: true,
	}),
);

app.use(
	cors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
	}),
);

app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
	max: process.env.RATE_LIMIT || 3000,
	window: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour.',
});

const ngoLimiter = rateLimit({
	max: process.env.RATE_LIMIT || 3000,
	window: 60 * 10 * 1000,
	message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/', translator, limiter);
app.use('/ngo', translator, ngoLimiter);

app.use(routes);

app.use(mongoSanitize());
app.use(xss());

module.exports = app;
