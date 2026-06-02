const express = require('express');
const router = express.Router();
const centroController = require('../controllers/centroController');

router.post('/', centroController.crearCentro);

module.exports = router;