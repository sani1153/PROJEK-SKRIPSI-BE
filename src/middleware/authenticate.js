const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRETKEY');
    req.user = decoded; // Simpan payload ke `req.user`
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid atau kadaluarsa' });
  }
};

module.exports = authenticate;
