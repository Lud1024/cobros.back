// middleware/authorization.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

// Middleware para verificar permisos específicos
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Buscar roles del usuario para la cartera específica
      // Por simplicidad, asumimos que el rol viene en el token
      // En producción, consultar usuario_roles por id_usuario y id_cartera

      const userRoles = await sequelize.query(
        `SELECT r.nombre_rol, r.permisos
         FROM usuario_roles ur
         JOIN roles r ON ur.id_rol = r.id_rol
         WHERE ur.id_usuario = :id_usuario`,
        {
          replacements: { id_usuario: req.user.id },
          type: QueryTypes.SELECT
        }
      );

      // Verificar si tiene el permiso requerido
      const hasPermission = userRoles.some(rol => {
        try {
          const permisos = JSON.parse(rol.permisos || '{}');
          return permisos[permission] === true;
        } catch {
          return false;
        }
      });

      if (!hasPermission) {
        return res.status(403).json({ error: 'Permisos insuficientes' });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

// Middleware para verificar acceso a cartera específica
const requireCarteraAccess = (req, res, next) => {
  // Por simplicidad, permitir acceso a todas las carteras
  // En producción, verificar usuario_roles por id_cartera
  next();
};

// Middleware para roles específicos
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const userRoles = await sequelize.query(
        `SELECT r.nombre_rol
         FROM usuario_roles ur
         JOIN roles r ON ur.id_rol = r.id_rol
         WHERE ur.id_usuario = :id_usuario`,
        {
          replacements: { id_usuario: req.user.id },
          type: QueryTypes.SELECT
        }
      );

      const userRoleNames = userRoles.map(r => r.nombre_rol);
      const hasRequiredRole = roles.some(role => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Rol requerido no encontrado' });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error verificando roles' });
    }
  };
};

// Middleware para verificar si usuario está activo
const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.user.estado !== 'A') {
    return res.status(403).json({ error: 'Usuario inactivo' });
  }

  next();
};

module.exports = {
  requirePermission,
  requireCarteraAccess,
  requireRole,
  requireActiveUser
};