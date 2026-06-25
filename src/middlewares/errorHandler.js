const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  console.error('=== ERROR CAPTURADO ===');
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details || null
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'ConflictError',
      message: 'El recurso que intentas crear ya existe (llave única duplicada).'
    });
  }

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Ocurrió un error interno en el servidor.'
  });
};

module.exports = errorHandler;
