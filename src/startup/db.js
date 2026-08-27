import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export default function () {
  mongoose
    .connect('mongodb+srv://samurdhi:2001@cluster0.hhl5j.mongodb.net/?appName=Cluster0') // auto matically create a database
    .then(() => logger.info('Connected to the Database'))
    .catch((error) => {
      logger.error(error);
    });
}
