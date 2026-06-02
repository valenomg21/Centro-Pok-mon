const express = require('express');
const router = express.Router();
const salaController = require('../controller/salaController');

router.get('/', salaController.obtenerSalas);
router.post('/', salaController.crearSalas);

module.exports = router;