const { body } = require('express-validator');

const crearPacienteValidators = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del Pokémon es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
  body('especie')
    .trim()
    .notEmpty()
    .withMessage('La especie es obligatoria.'),
  body('tipo')
    .trim()
    .notEmpty()
    .withMessage('El tipo es obligatorio.'),
  body('nivel')
    .notEmpty()
    .withMessage('El nivel es obligatorio.')
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage('El nivel debe ser un número entero entre 1 y 100.'),
  body('estadoSalud')
    .notEmpty()
    .withMessage('El estado de salud es obligatorio.')
    .bail()
    .isIn(['sano', 'debil', 'herido', 'grave', 'critico'])
    .withMessage('El estado de salud ingresado no es válido.'),
  body('efecto')
    .optional()
    .isIn(['ninguno', 'envenenado', 'paralizado', 'quemado', 'dormido', 'congelado', 'confundido'])
    .withMessage('El efecto o condición ingresado no es válido.'),
  body('salaId')
    .notEmpty()
    .withMessage('La sala asignada es obligatoria.')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('La sala asignada debe ser un número entero positivo.')
];

module.exports = {
  crearPacienteValidators
};