const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

const { registerValidators, loginValidators } = require('../validators/auth.validators');
const validateFields = require('../middlewares/validateFields');

router.post('/login', loginValidators, validateFields, authController.login);
router.post('/registro', registerValidators, validateFields, authController.registro);

module.exports = router;