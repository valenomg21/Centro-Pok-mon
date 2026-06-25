const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_centro_pokemon';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó un token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.id = payload.id;
    req.email = payload.email;
    req.role = payload.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token no válido o expirado' });
  }
};

module.exports = verifyToken;