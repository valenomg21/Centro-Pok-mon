const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearCentro = async (req, res) => {
  try {
    const { nombre, capacidad, ciudad } = req.body; // Ajusta los campos según tu schema.prisma
    const nuevoCentro = await prisma.centroPokemon.create({
      data: {
        nombre,
        capacidad: Number(capacidad) || Number(capacidad),
        ciudad: ciudad
      }
    });
    res.status(201).json(nuevoCentro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el Centro Pokémon' });
  }
};

module.exports = { crearCentro };