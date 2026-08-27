import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export default function () {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose
    .connect(mongoUri)
    .then(() => logger.info('Connected to the Database'))
    .catch((error) => {
      logger.error(error);
    });
}
