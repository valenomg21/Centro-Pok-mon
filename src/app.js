const express = require("express")
const cors = require("cors")

const app = express()
const prisma = require("./config/prisma")

// middlewares
app.use(cors())
app.use(express.json())

// ruta de testeo
app.get("/", (req, res) => {
  res.json({
    mensaje: "API Centro Pokemon funcionando"
  })
})
// rutas de pacientes
const pacientesRutas = require('./routes/pacientes');
app.use('/pacientes', pacientesRutas)

//ruta de salas
const salasRutas = require('./routes/salas');
app.use('/salas', salasRutas);

//ruta de centros
const centrosRutas = require('./routes/centros');
app.use('/centros', centrosRutas);
/*
app.get("/test-pokemon", async (req, res) => {
  try {
    const pacientes = await prisma.pokemonPaciente.findMany()

    res.json(pacientes)
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener pacientes"
    })
  }
})
*/
module.exports = app