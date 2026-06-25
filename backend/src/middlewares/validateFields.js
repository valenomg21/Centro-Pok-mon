const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => error.msg)
      .join(' | ');

    return next(new AppError(messages, 400));
  }

  next();
};

module.exports = validateFields;