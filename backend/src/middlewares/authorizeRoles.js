const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'No tienes los permisos necesarios para esta acción' });
    }

    next();
  };
};

module.exports = authorizeRoles;