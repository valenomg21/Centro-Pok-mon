const express = require('express')
const router = express.Router()
const entrenadorController = require('../controller/entrenadorController')

router.get('/', entrenadorController.obtenerEntrenadores)

module.exports = router