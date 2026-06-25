const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_centro_pokemon';

const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Por favor, completa todos los campos.' });
    }

    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
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
    console.error(error);
    res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor, introduce correo y contraseña.' });
    }

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
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
    console.error(error);
    res.status(500).json({ error: 'Error del servidor durante el inicio de sesión.' });
  }
};

module.exports = {
  registro,
  login
};