const app = require('./src/app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const http = require('http');
const server = http.createServer(app);
const MONGODB_URI = process.env.MONGODB;

mongoose
	.connect(MONGODB_URI)
	.then(() => console.log(`DB successfully connected`))
	.catch((err) => console.error(err));
const port = process.env.PORT || 8000;
server.listen(port, () => {
	console.log(`App running on port: ${port}`);
});
