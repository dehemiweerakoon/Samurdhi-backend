export default function (req, res, next) {
  // req.user
  try {
    if (!req.user || !req.user.isAdmin) return res.status(403).send('Access denied');
  } catch (err) {
    return res.status(403).send('Access denied');
  }
  next();
};
