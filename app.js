// app.js
const express = require("express");
const cors = require("cors");
const app     = express();

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Montar rutas de autenticación (públicas)
app.use("/auth", require("./routes/auth.routes"));

// Montar rutas protegidas
app.use("/usuarios", require("./routes/usuarios.routes"));
app.use("/roles", require("./routes/roles.routes"));
app.use("/carteras", require("./routes/carteras.routes"));
app.use("/clientes", require("./routes/clientes.routes"));
app.use("/prestamos", require("./routes/prestamos.routes"));
app.use("/periodicidades", require("./routes/periodicidades.routes"));
app.use("/pagos", require("./routes/pagos.routes"));
app.use("/cuotas", require("./routes/cuotas.routes"));
app.use("/metodos-garantia", require("./routes/metodos_garantia.routes"));
app.use("/prestamo-garantia", require("./routes/prestamo_garantia.routes"));
app.use("/cliente-documentos", require("./routes/cliente_documentos.routes"));
app.use("/visitas-cobro", require("./routes/visitas_cobro.routes"));
app.use("/verificaciones-prestamo", require("./routes/verificaciones_prestamo.routes"));
app.use("/rechazos-historial", require("./routes/rechazos_historial.routes"));
app.use("/mora-eventos", require("./routes/mora_eventos.routes"));
app.use("/pago-aplicaciones", require("./routes/pago_aplicaciones.routes"));
app.use("/politicas-mora", require("./routes/politicas_mora.routes"));
app.use("/usuario-roles", require("./routes/usuario_roles.routes"));
app.use("/rol-cartera", require("./routes/rol_cartera.routes"));
// Sistema de cobros completo implementado! 🚀

app.get("/", (req, res) => res.send("API de Préstamos y Cobros activa"));

module.exports = app;
