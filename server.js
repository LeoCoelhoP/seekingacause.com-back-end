const app = require('./src/app');
const dotenv = require('dotenv');
const http = require('http');
const mongoose = require('mongoose');

dotenv.config();

const MONGODB_URI = process.env.MONGODB;
const port = process.env.PORT || 8000;

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('DB successfully connected');

    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Server runing on port: ${port}`);
    });

    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error('Failed to connect start the server.', error);
    process.exit(1);
  }
}

startServer();
