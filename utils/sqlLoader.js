// utils/sqlLoader.js
const fs   = require("fs");
const path = require("path");

function loadSQLQueries() {
  const dir   = path.join(__dirname, "..", "sql");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql"));
  const queries = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    // Split en bloques por "-- name: identificador"
    const parts = content
      .split(/^-- name:\s*([a-zA-Z0-9_]+)$/m)
      .slice(1);
      // partes: [ name1, sql1, name2, sql2, … ]
    for (let i = 0; i < parts.length; i += 2) {
      const name = parts[i].trim();
      const sql  = parts[i+1].trim();
      queries[name] = sql;
    }
  }

  return queries;
}

module.exports = loadSQLQueries;
