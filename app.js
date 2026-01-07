// app.js
const express = require("express");
const cors = require("cors");
const app = express();

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://api-cobros.catchcode.es',
    'https://catchcode.es',
    /\.catchcode\.es$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Router para agrupar todas las rutas
const apiRouter = express.Router();

// Ruta raíz con status 200
apiRouter.get("/", (req, res) => {
  res.status(200).send("API de Préstamos y Cobros - Sistema activo");
});

// Ruta de health check
apiRouter.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

// Montar rutas de autenticación (públicas)
apiRouter.use("/auth", require("./routes/auth.routes"));

// Montar rutas protegidas
apiRouter.use("/usuarios", require("./routes/usuarios.routes"));
apiRouter.use("/roles", require("./routes/roles.routes"));
apiRouter.use("/carteras", require("./routes/carteras.routes"));
apiRouter.use("/clientes", require("./routes/clientes.routes"));
apiRouter.use("/prestamos", require("./routes/prestamos.routes"));
apiRouter.use("/periodicidades", require("./routes/periodicidades.routes"));
apiRouter.use("/pagos", require("./routes/pagos.routes"));
apiRouter.use("/cuotas", require("./routes/cuotas.routes"));
apiRouter.use("/metodos-garantia", require("./routes/metodos_garantia.routes"));
apiRouter.use("/prestamo-garantia", require("./routes/prestamo_garantia.routes"));
apiRouter.use("/cliente-documentos", require("./routes/cliente_documentos.routes"));
apiRouter.use("/visitas-cobro", require("./routes/visitas_cobro.routes"));
apiRouter.use("/verificaciones-prestamo", require("./routes/verificaciones_prestamo.routes"));
apiRouter.use("/rechazos-historial", require("./routes/rechazos_historial.routes"));
apiRouter.use("/mora-eventos", require("./routes/mora_eventos.routes"));
apiRouter.use("/pago-aplicaciones", require("./routes/pago_aplicaciones.routes"));
apiRouter.use("/politicas-mora", require("./routes/politicas_mora.routes"));
apiRouter.use("/usuario-roles", require("./routes/usuario_roles.routes"));
apiRouter.use("/rol-cartera", require("./routes/rol_cartera.routes"));

// Montar el router en la raíz y en /api para flexibilidad
app.use("/", apiRouter);
app.use("/api", apiRouter);

module.exports = app;
