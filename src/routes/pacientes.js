const express = require('express')
const router = Router = express.Router()
const pacienteController = require('../controller/pacienteController')

const verifyToken = require('../middlewares/verifyToken')
const authorizeRoles = require('../middlewares/authorizeRoles')
const validateFields = require('../middlewares/validateFields')
const { crearPacienteValidators } = require('../validators/paciente.validators')

router.get('/', verifyToken, pacienteController.obtenerPacientes)

router.post('/', 
  verifyToken, 
  authorizeRoles('ADMIN', 'SUPERADMIN'), 
  crearPacienteValidators, 
  validateFields,         
  pacienteController.crearPaciente
)

router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), pacienteController.actualizarPaciente)

router.delete('/:id', verifyToken, authorizeRoles('ADMIN', 'SUPERADMIN'), pacienteController.eliminarPaciente)

module.exports = router