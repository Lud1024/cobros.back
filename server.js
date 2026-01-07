// server.js
const app = require("./app");

// Para cPanel con Phusion Passenger
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// Passenger asigna el puerto dinámicamente via process.env.PORT
// O usa 'passenger' como socket
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

// Exportar app para Passenger
module.exports = app;
