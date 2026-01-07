# Code Patterns in cobros.back Project

## Overview
This is a Node.js backend application for managing loans and collections ("prestamos y cobros"). It follows a structured MVC-like pattern with raw SQL queries instead of ORM models.

## Project Structure
- **server.js**: Entry point, starts the Express server on port 3000 (or env PORT).
- **app.js**: Main Express app setup, mounts routes, basic middleware (JSON parsing).
- **config/db.js**: Database configuration using Sequelize for MySQL connection, with env-based prod/local switching.
- **controllers/**: Business logic handlers for each resource (e.g., clientes.controller.js).
- **routes/**: Route definitions mapping endpoints to controller methods (e.g., clientes.routes.js).
- **sql/**: Raw SQL queries stored in .sql files, organized by resource.
- **utils/sqlLoader.js**: Utility to load and parse SQL queries from files by named sections.

## Dependencies
- **express**: Web framework for routing and middleware.
- **sequelize**: ORM for DB connection (used minimally, mainly for raw queries).
- **mysql2**: MySQL driver.
- **dotenv**: Environment variable management.
- **nodemon**: Dev tool for auto-restart.

## Database Configuration Pattern
- Uses Sequelize instance for connection.
- Env vars for DB credentials, switches between production and local based on NODE_ENV.
- Local development DB: "cobros" on localhost:3306, user "root", pass "admin".
- Production DB configured via env vars (tu_bd_produccion, etc.).
- No logging, no timestamps in define.
- Authenticates on startup, logs success/error.

## SQL Query Management Pattern
- SQL queries stored in separate .sql files.
- Each query prefixed with `-- name: identifier` comment.
- sqlLoader parses files, splits by name, returns object of named queries.
- Controllers import this object and use queries by name.

## Controller Pattern
- Async/await functions for each CRUD operation.
- Uses sequelize.query with QueryTypes (SELECT, INSERT, UPDATE, DELETE).
- Replacements for parameterized queries to prevent SQL injection.
- Try/catch blocks with console.error and 500 status responses.
- Standard CRUD: getAll, getById, create, update, remove.

## Routing Pattern
- Express Router instances per resource.
- Standard REST endpoints: GET /, GET /:id, POST /, PUT /:id, DELETE /:id.
- Maps directly to controller methods.
- Mounted in app.js under resource paths (e.g., /clientes).

## Overall Architecture
- Separation of concerns: Routes → Controllers → SQL.
- No models layer; raw SQL with named queries.
- Environment-based config for dev/prod.
- Simple, lightweight setup focused on MySQL operations.
- Scalable structure for adding more resources (prestamos, pagos, etc.).

## Key Patterns
1. **Named SQL Queries**: Organized, reusable SQL in files.
2. **Parameterized Queries**: Safe replacements in controllers.
3. **Consistent Error Handling**: Try/catch with logging and JSON errors.
4. **Modular Structure**: Clear folders for config, controllers, routes, sql, utils.
5. **Env-Driven Config**: Flexible deployment for different environments.