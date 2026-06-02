const prisma = require('../config/prisma')

const obtenerEntrenadores = async (req, res) => {
  try {
    const entrenadores = await prisma.entrenador.findMany()
    res.json(entrenadores)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener entrenadores' })
  }
}

module.exports = {
  obtenerEntrenadores
}