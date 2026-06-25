const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const authRutas = require('./routes/auth')
app.use('/auth', authRutas)

const pacientesRutas = require('./routes/pacientes')
app.use('/pokemon', pacientesRutas)

const salasRutas = require('./routes/salas')
app.use('/salas', salasRutas)

const centrosRutas = require('./routes/centros')
app.use('/centros', centrosRutas)

const entrenadoresRutas = require('./routes/entrenadores')
app.use('/entrenadores', entrenadoresRutas)

app.get("/", (req, res) => {
  res.json({
    mensaje: "API Centro Pokemon funcionando"
  })
})

const errorHandler = require('./middlewares/errorHandler')
app.use(errorHandler)

module.exports = app