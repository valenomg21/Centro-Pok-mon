const { body } = require('express-validator');

const registerValidators = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .bail()
    .isEmail()
    .withMessage('Introduce un correo electrónico válido.')
    .bail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .bail()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener un mínimo de 6 caracteres.')
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .bail()
    .isEmail()
    .withMessage('Introduce un correo electrónico válido.'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
];

module.exports = {
  registerValidators,
  loginValidators
};