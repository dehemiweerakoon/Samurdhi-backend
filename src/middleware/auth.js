import jwt from 'jsonwebtoken';
import config from 'config';

export default function (req, res, next) {
  const headerToken = req.header('x-auth-token') || req.header('authorization');
  const token = headerToken?.replace(/^Bearer\s+/i, '').trim().replace(/^"(.*)"$/, '$1');

  if (!token) return res.status(401).send('Access Denied no token provided');

  try {
    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY || config.get('jwtPrivateKey');
    if (!jwtPrivateKey) throw new Error('JWT_PRIVATE_KEY is not configured');

    const decode = jwt.verify(token, jwtPrivateKey);
    req.user = decode; // get the payload
    return next();
  } catch (err) {
    console.log(`JWT verification failed: ${err.message}`);
    return res.status(401).send('Invalid or expired token');
  }
}
