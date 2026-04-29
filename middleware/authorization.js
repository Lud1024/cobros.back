// middleware/authorization.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

const parsePermissions = (rawPermissions) => {
  if (!rawPermissions) return {};
  if (typeof rawPermissions === 'object') return rawPermissions;

  try {
    const parsed = JSON.parse(rawPermissions);
    if (typeof parsed === 'string') return parsePermissions(parsed);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const hasAdminRole = (roles) => roles.some((rol) => rol.nombre_rol === 'Administrador');

// Verifica permisos especificos. Acepta string o arreglo de permisos (OR).
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

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

      const permisosRequeridos = Array.isArray(permission) ? permission : [permission];
      const hasPermission = hasAdminRole(userRoles) || userRoles.some((rol) => {
        const permisos = parsePermissions(rol.permisos);
        return permisosRequeridos.some((permiso) => permisos[permiso] === true);
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

// Middleware para verificar acceso a cartera especifica.
const requireCarteraAccess = (req, res, next) => {
  // Pendiente: validar usuario_roles por id_cartera cuando la ruta lo provea.
  next();
};

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

      const userRoleNames = userRoles.map((r) => r.nombre_rol);
      const hasRequiredRole = roles.some((role) => userRoleNames.includes(role));

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
  requireActiveUser,
  parsePermissions
};
