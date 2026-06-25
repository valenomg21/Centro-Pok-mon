const prisma = require('../config/prisma')

const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await prisma.pokemonPaciente.findMany({
      include: {
        entrenador: true, 
        sala: true
      }
    })
    res.json(pacientes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener los pacientes' })
  }
}

const crearPaciente = async (req, res) => {
  try {
    const { nombre, especie, tipo, nivel, estadoSalud, internado, shiny, efecto, entrenadorId, salaId } = req.body
    
    const nuevoPaciente = await prisma.pokemonPaciente.create({
      data: {
        nombre: nombre,
        especie: especie,
        tipo: tipo,
        nivel: Number(nivel),
        estadoSalud: estadoSalud,
        internado: internado !== undefined ? (internado === true || internado === 'true') : true,
        shiny: shiny !== undefined ? (shiny === true || shiny === 'true') : false,
        efecto: efecto || 'ninguno',
        sala: {
          connect: { id: Number(salaId) }
        },
        ...(entrenadorId && {
          entrenador: {
            connect: { id: Number(entrenadorId) }
          }
        })
      }
    })
    res.status(201).json(nuevoPaciente)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar el Pokémon paciente' })
  }
}

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params
    const datosActualizados = req.body

    if (datosActualizados.nivel) datosActualizados.nivel = Number(datosActualizados.nivel)
    if (datosActualizados.entrenadorId) datosActualizados.entrenadorId = Number(datosActualizados.entrenadorId)
    if (datosActualizados.salaId) datosActualizados.salaId = Number(datosActualizados.salaId)
    if (datosActualizados.internado !== undefined) datosActualizados.internado = (datosActualizados.internado === true || datosActualizados.internado === 'true')
    if (datosActualizados.shiny !== undefined) datosActualizados.shiny = (datosActualizados.shiny === true || datosActualizados.shiny === 'true')

    const pacienteEditado = await prisma.pokemonPaciente.update({
      where: { id: Number(id) },
      data: datosActualizados
    })
    
    res.json(pacienteEditado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar los datos del paciente' })
  }
}

const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.pokemonPaciente.delete({
      where: { id: Number(id) }
    })
    res.json({ mensaje: 'Paciente eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar el paciente' })
  }
}

module.exports = {
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
}