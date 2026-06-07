const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function requireAuth(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = getJwtSecret();

  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET no esta configurado.' });
  }

  if (!token) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  try {
    req.admin = jwt.verify(token, secret);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Token invalido o vencido.' });
  }
}

function signAdminToken(username) {
  const secret = getJwtSecret();

  if (!secret) {
    const error = new Error('JWT_SECRET no esta configurado.');
    error.status = 500;
    throw error;
  }

  return jwt.sign({ username, role: 'admin' }, secret, { expiresIn: '8h' });
}

module.exports = {
  requireAuth,
  signAdminToken
};
