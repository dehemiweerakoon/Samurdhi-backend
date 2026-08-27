import jwt from 'jsonwebtoken';
import config from 'config';

export default function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).send('Access Denied no token provided');

  try {
    const decode = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decode; // get the payload
    next();
  } catch (err) {
    console.log(err.message);
    res.status(400).send('Invalid token');
  }
}
