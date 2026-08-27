import winston from 'winston';

export default function (err, req, res, next) {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.File({ filename: 'app.log', level: 'info' })],
  });

  if (err.type === 'entity.parse.failed' && err.status === 400) {
    logger.warn('Invalid JSON request body');
    return res.status(400).send('Invalid JSON request body');
  }

  logger.error(err.message);
  console.error(err.message);
  return res.status(500).send('Something Failed');
}
