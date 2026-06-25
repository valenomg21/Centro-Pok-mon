const prisma = require('../config/prisma')

const obtenerSalas = async (req, res) => {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        pacientes: true
      }
    })
    res.json(salas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las salas' })
  }
}

const crearSalas = async (req, res) => {
  try {
    const { nombre, tipo, centroId, ocupada } = req.body

    const nuevaSala = await prisma.sala.create({
      data: {
        nombre: nombre,
        tipo: tipo,
        ocupada: ocupada === true || ocupada === 'true',
        createdAt: new Date(),
        centro: {
          connect: { id: Number(centroId) }
        }
      }
    })

    res.status(201).json(nuevaSala)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar la sala médica' })
  }
}

const actualizarSala = async (req, res) => {
  try {
    const { id } = req.params
    const { ocupada } = req.body

    const salaActualizada = await prisma.sala.update({
      where: { id: Number(id) },
      data: {
        ocupada: ocupada === true || ocupada === 'true'
      }
    })
    res.json(salaActualizada)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar la sala' })
  }
}

module.exports = {
  obtenerSalas,
  crearSalas,
  actualizarSala
}