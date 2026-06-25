const express = require('express');
const router = express.Router();
const salaController = require('../controller/salacontroller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRoles = require('../middlewares/authorizeRoles');

router.get('/', verifyToken, salaController.obtenerSalas);

router.post('/', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), salaController.crearSalas);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), salaController.actualizarSala);

module.exports = router;