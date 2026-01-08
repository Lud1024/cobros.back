// middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    req.user = user; // Información del usuario decodificada (incluye roles)
    next();
  });
};

// Función para generar token JWT (duración: 30 minutos)
const generateToken = (user, roles = []) => {
  return jwt.sign(
    {
      id: user.id_usuario,
      usuario: user.usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      estado: user.estado,
      roles: roles.map(r => ({
        id_rol: r.id_rol,
        nombre_rol: r.nombre_rol,
        id_cartera: r.id_cartera
      })),
      carteras: [...new Set(roles.map(r => r.id_cartera))]
    },
    process.env.JWT_SECRET,
    { expiresIn: '30m' } // Sesión de 30 minutos
  );
};

// Middleware para verificar permisos específicos
const requirePermission = (permiso) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Buscar si algún rol tiene el permiso
    const tienePermiso = req.user.roles?.some(rol => {
      if (rol.permisos) {
        const permisos = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : rol.permisos;
        return permisos[permiso] === true;
      }
      return false;
    });

    if (!tienePermiso) {
      return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    }

    next();
  };
};

// Middleware para verificar acceso a una cartera específica
const requireCartera = (req, res, next) => {
  const idCartera = parseInt(req.params.id_cartera || req.body.id_cartera || req.query.id_cartera);
  
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!idCartera) {
    return next(); // Si no hay cartera especificada, continuar
  }

  const tieneAcceso = req.user.carteras?.includes(idCartera);
  
  if (!tieneAcceso) {
    return res.status(403).json({ error: 'No tiene acceso a esta cartera' });
  }

  next();
};

// Middleware opcional para rutas públicas
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  optionalAuth,
  requirePermission,
  requireCartera
};