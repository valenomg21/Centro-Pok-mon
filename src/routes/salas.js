const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');

router.get('/', salaController.obtenerSalas);
router.post('/', salaController.crearSalas);

module.exports = router;