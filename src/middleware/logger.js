import winston from 'winston';

export default function (ex) {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.File({ filename: 'error.log', level: 'warn' })],
  });
  logger.error(ex.message, ex);
}
