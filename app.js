// app.js
const express = require("express");
const cors = require("cors");
const app = express();

const parseEnvList = (value) => String(value || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// Lista de origenes permitidos.
// En produccion se puede ampliar con:
// CORS_ORIGINS=https://creditos.catchcode.es,https://otro-dominio.com
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3300",
  "http://creditos.catchcode.es",
  "https://creditos.catchcode.es",
  "https://api-cobros.catchcode.es",
  "https://catchcode.es",
  "http://catchcode.es",
  ...parseEnvList(process.env.CORS_ORIGINS),
];

// Patrones regex para origenes dinamicos
const originPatterns = [
  /^https?:\/\/.*\.catchcode\.es$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // Permitir requests sin origin
  if (allowedOrigins.includes(origin)) return true;
  return originPatterns.some((pattern) => pattern.test(origin));
}

const corsMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const corsDefaultHeaders = ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"];

// Respuesta CORS explicita antes de rutas/middlewares. Esto evita que el
// preflight falle si el navegador pregunta por headers en distinto casing.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", corsMethods.join(", "));
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || corsDefaultHeaders.join(", ")
    );
  }

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) {
      console.warn("CORS preflight blocked origin:", origin);
      return res.sendStatus(403);
    }
    return res.sendStatus(204);
  }

  next();
});

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: corsMethods,
  allowedHeaders: corsDefaultHeaders,
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(express.json());

// Router para agrupar todas las rutas
const apiRouter = express.Router();

// Ruta raiz con status 200
apiRouter.get("/", (req, res) => {
  res.status(200).send("API de Prestamos y Cobros - Sistema activo");
});

// Ruta de health check
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Montar rutas de autenticacion publicas
apiRouter.use("/auth", require("./routes/auth.routes"));

// Montar rutas protegidas
apiRouter.use("/usuarios", require("./routes/usuarios.routes"));
apiRouter.use("/roles", require("./routes/roles.routes"));
apiRouter.use("/carteras", require("./routes/carteras.routes"));
apiRouter.use("/clientes", require("./routes/clientes.routes"));
apiRouter.use("/cliente-referencias", require("./routes/cliente_referencias.routes"));
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
apiRouter.use("/reportes", require("./routes/reportes.routes"));

// Montar el router en la raiz y en /api para flexibilidad
app.use("/", apiRouter);
app.use("/api", apiRouter);

module.exports = app;
