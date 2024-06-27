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

app.options(
	'*',
	cors({
		origin: '*',
		methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
		credentials: true,
	}),
);

app.use((req, res, next) => {
	res.header(
		'Access-Control-Allow-Origin',
		'https://seekingacause-com.vercel.app',
	);
	res.header('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE, PUT');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

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

app.use(mongoSanitize());
app.use(xss());

app.use(routes);

module.exports = app;
