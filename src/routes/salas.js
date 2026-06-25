const express = require('express');
const router = express.Router();
const salaController = require('../controller/salacontroller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Cualquier usuario logueado puede ver las salas
router.get('/', verifyToken, salaController.obtenerSalas);

// Solo administradores pueden crear o actualizar salas
router.post('/', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), salaController.crearSalas);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), salaController.actualizarSala);

module.exports = router;