const prisma = require('../config/prisma');

// --- LECTURA (GET) ---
const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await prisma.pokemonPaciente.findMany({
      include: {
        entrenador: true, 
        sala: true
      }
    });
    res.json(pacientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pacientes' });
  }
};

// --- ESCRITURA (POST) ---
const crearPaciente = async (req, res) => {
  try {
    const { nombre, especie, tipo, nivel, estadoSalud, internado, entrenadorId, salaId } = req.body;
    
const nuevoPaciente = await prisma.pokemonPaciente.create({
      data: {
        nombre: nombre,
        especie: especie,
        tipo: tipo,
        nivel: Number(nivel),
        estadoSalud: estadoSalud,
        internado: internado !== undefined ? (internado === true || internado === 'true') : true,
        
        // 1. Conectamos con la Sala Médica (Obligatorio)
        sala: {
          connect: { id: Number(salaId) }
        },

        // 2. Conectamos con el Entrenador SOLO si nos enviaron un ID
        // Si no viene, no ponemos el objeto 'connect' para que quede en null (Salvaje)
        ...(entrenadorId && {
          entrenador: {
            connect: { id: Number(entrenadorId) }
          }
        })
      }
    });
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el Pokémon paciente' });
  }
};

// --- MODIFICACIÓN (PUT) ---
const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Conversiones de seguridad asegurando que los IDs y niveles sean números
    if (datosActualizados.nivel) datosActualizados.nivel = Number(datosActualizados.nivel);
    if (datosActualizados.entrenadorId) datosActualizados.entrenadorId = Number(datosActualizados.entrenadorId);
    if (datosActualizados.salaId) datosActualizados.salaId = Number(datosActualizados.salaId);

    const pacienteEditado = await prisma.pokemonPaciente.update({
      where: { id: Number(id) },
      data: datosActualizados
    });
    
    res.json(pacienteEditado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar los datos del paciente' });
  }
};

module.exports = {
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente
};