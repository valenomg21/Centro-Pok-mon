const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/', pacienteController.obtenerPacientes);

router.post('/', pacienteController.crearPaciente);

router.put('/:id', pacienteController.actualizarPaciente);

module.exports = router;