const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_centro_pokemon';

const registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return next(new AppError('Por favor, completa todos los campos.', 400));
    }

    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return next(new AppError('El correo electrónico ya está registrado.', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        role: 'USER'
      }
    });

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;

    res.status(201).json({
      mensaje: 'Registro exitoso',
      usuario: usuarioSinPassword
    });

  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Por favor, introduce correo y contraseña.', 400));
    }

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return next(new AppError('Credenciales incorrectas.', 400));
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return next(new AppError('Credenciales incorrectas.', 400));
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;

    res.status(200).json({
      mensaje: 'Login exitoso',
      usuario: usuarioSinPassword,
      token
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registro,
  login
};