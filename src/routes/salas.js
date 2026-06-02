const express = require('express')
const router = express.Router()
const salaController = require('../controller/salacontroller')

router.get('/', salaController.obtenerSalas)
router.post('/', salaController.crearSalas)
router.put('/:id', salaController.actualizarSala)

module.exports = router