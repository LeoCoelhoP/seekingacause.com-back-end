const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cors = require('cors');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const telegramBot = require('./services/telegramBot');
const translator = require('./utils/translator');

const app = express();

const corsOptions = {
  origin: ['https://seekingacause-com.onrender.com'],
  methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.set('trust proxy', 1);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const rateLimiter = rateLimit({
  max: process.env.RATE_LIMIT || 5000,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use(rateLimiter);

app.use(mongoSanitize());
app.use(xss());

app.use('/', translator, routes);

telegramBot.initialize();

module.exports = app;
