const prisma = require('../config/prisma');

//lectura
const obtenerSalas = async (req, res) => {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        pacientes: true // Incluye los Pokémon que están adentro de cada sala
      }
    });
    res.json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las salas' });
  }
};

//escritura
const crearSalas = async (req, res) => {
  try {
    // 1. Extraemos todos los campos del body
    const { nombre, tipo, centroId, ocupada } = req.body;

    // 2. Creamos la sala en Prisma con todos tus campos obligatorios y opcionales
    const nuevaSala = await prisma.sala.create({
      data: {
        nombre: nombre,
        tipo: tipo,
        ocupada: ocupada === true || ocupada === 'true', // Convierte a booleano de forma segura
        createdAt: new Date(), // Crea el DateTime actual
        centro: {
          connect: { id: Number(centroId) }
        }
      }
    });

    // 3. Respuesta exitosa
    res.status(201).json(nuevaSala);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la sala médica' });
  }
};

module.exports = {
  obtenerSalas,
  crearSalas,
};