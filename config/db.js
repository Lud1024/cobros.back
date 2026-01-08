// config/db.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// CONFIGURACIÓN: Cambiar entre producción y desarrollo
const ES_PRODUCCION = false; // true = Producción | false = Local

const DB_NAME = ES_PRODUCCION ? process.env.DB_NAME  : process.env.DB_NAME2;
const DB_USER = ES_PRODUCCION ? process.env.DB_USER  : process.env.DB_USER2;
const DB_PASS = ES_PRODUCCION ? process.env.DB_PASS  : process.env.DB_PASS2;
const DB_HOST = ES_PRODUCCION ? process.env.DB_HOST  : process.env.DB_HOST2;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: false
  }
});

sequelize.authenticate()
  .then(() => console.log(`✅ Conectado a ${ES_PRODUCCION ? "Producción" : "Local"}`))
  .catch(e => console.error(`❌ Error conexión:`, e));

module.exports = sequelize;
