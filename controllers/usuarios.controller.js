// controllers/usuarios.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const argon2 = require('argon2');
const crypto = require('crypto');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { sendConfirmationEmail } = require('../utils/mailer');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Función para validar contraseña
function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return 'La contraseña debe tener al menos 8 caracteres';
  if (!hasUpper) return 'La contraseña debe contener al menos una letra mayúscula';
  if (!hasLower) return 'La contraseña debe contener al menos una letra minúscula';
  if (!hasNumber) return 'La contraseña debe contener al menos un número';
  if (!hasSpecial) return 'La contraseña debe contener al menos un carácter especial';

  return null;
}

/**
 * GET /usuarios
 */
exports.getAll = async (req, res) => {
  try {
    const usuarios = await sequelize.query(sql.listUsuarios, { type: QueryTypes.SELECT });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * GET /usuarios/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarios = await sequelize.query(sql.getUsuarioById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!usuarios.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuarios[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * POST /usuarios
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { usuario, password, nombre, apellido, correo, telefono } = req.body;

    // Validar contraseña
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    // Verificar unicidad de usuario
    const existingUser = await sequelize.query(sql.getUsuarioByUsuario, {
      replacements: { usuario },
      type: QueryTypes.SELECT,
      transaction
    });
    if (existingUser.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Verificar unicidad de correo
    const existingEmail = await sequelize.query(
      'SELECT * FROM usuarios WHERE correo = :correo',
      {
        replacements: { correo },
        type: QueryTypes.SELECT,
        transaction
      }
    );
    if (existingEmail.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await argon2.hash(password);

    const [result] = await sequelize.query(sql.createUsuario, {
      replacements: {
        usuario,
        password_hash: hashedPassword,
        nombre,
        apellido,
        correo,
        telefono
      },
      type: QueryTypes.INSERT,
      transaction
    });

    const userId = result; // Asumiendo que result es el id insertado

    // Enviar correo de confirmación con id como token
    try {
      await sendConfirmationEmail(correo, nombre, userId.toString());
    } catch (emailErr) {
      console.error('Error enviando correo:', emailErr);
      await transaction.rollback();
      return res.status(500).json({ error: 'Error enviando correo de confirmación' });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Usuario creado y correo enviado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

/**
 * PATCH /usuarios/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Construir SET dinámico solo con campos enviados
    const allowedFields = ['usuario', 'nombre', 'apellido', 'correo', 'telefono', 'estado'];
    const setFields = [];
    const replacements = { id };

    // Si se actualiza password, validar y hashear
    if (updates.password) {
      const passwordError = validatePassword(updates.password);
      if (passwordError) return res.status(400).json({ error: passwordError });
      replacements.password_hash = await argon2.hash(updates.password);
      setFields.push('password_hash = :password_hash');
    }

    // Verificar unicidad si se actualiza usuario
    if (updates.usuario) {
      const existingUser = await sequelize.query(sql.getUsuarioByUsuario, {
        replacements: { usuario: updates.usuario },
        type: QueryTypes.SELECT
      });
      if (existingUser.length && existingUser[0].id_usuario != id) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
    }

    // Verificar unicidad si se actualiza correo
    if (updates.correo) {
      const existingEmail = await sequelize.query(
        'SELECT * FROM usuarios WHERE correo = :correo',
        {
          replacements: { correo: updates.correo },
          type: QueryTypes.SELECT
        }
      );
      if (existingEmail.length && existingEmail[0].id_usuario != id) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }
    }

    // Construir SET dinámico con campos permitidos
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setFields.push(`${field} = :${field}`);
        replacements[field] = updates[field];
      }
    });

    if (setFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const updateQuery = `UPDATE usuarios SET ${setFields.join(', ')} WHERE id_usuario = :id`;

    await sequelize.query(updateQuery, {
      replacements,
      type: QueryTypes.UPDATE
    });
    
    logger.transaction('Usuario actualizado', { id_usuario: id, campos: Object.keys(replacements) });
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

/**
 * DELETE /usuarios/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteUsuario, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

/**
 * POST /usuarios/confirmar/:token
 */
exports.confirm = async (req, res) => {
  const { token } = req.params;
  try {
    const id = parseInt(token, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Token inválido' });

    await sequelize.query(sql.confirmUsuario, {
      replacements: { id },
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Usuario confirmado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al confirmar usuario' });
  }
};

/**
 * POST /usuarios/login
 */
exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    logger.info('Login attempt', { usuario: usuario ? usuario : 'N/A', ip: req.ip });

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Buscar usuario
    const usuarios = await sequelize.query(sql.getUsuarioByUsuario, {
      replacements: { usuario },
      type: QueryTypes.SELECT
    });

    if (!usuarios.length) {
      logger.warn('Login failed - user not found', { usuario: usuario ? usuario : 'N/A', ip: req.ip });
      return res.status(404).json({ error: 'USUARIO NO EXISTE' });
    }

    const user = usuarios[0];

    // Verificar contraseña
    const isValidPassword = await argon2.verify(user.password_hash, password);
    if (!isValidPassword) {
      logger.warn('Login failed - incorrect password', { usuario: usuario ? usuario : 'N/A', ip: req.ip });
      return res.status(401).json({ error: 'CONTRASEÑA INCORRECTA' });
    }

    // Verificar estado activo
    if (user.estado !== 'A') {
      logger.warn('Login failed - user inactive', { usuario: usuario ? usuario : 'N/A', ip: req.ip, estado: user.estado });
      return res.status(401).json({ error: 'USUARIO INACTIVO' });
    }

    // Obtener roles del usuario con información completa
    const rolesUsuario = await sequelize.query(`
      SELECT 
        ur.id_usuario,
        ur.id_rol,
        ur.id_cartera,
        r.nombre_rol,
        r.permisos,
        c.nombre AS nombre_cartera
      FROM usuario_roles ur
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      INNER JOIN carteras c ON ur.id_cartera = c.id_cartera
      WHERE ur.id_usuario = :id_usuario
    `, {
      replacements: { id_usuario: user.id_usuario },
      type: QueryTypes.SELECT
    });

    // Organizar los permisos por cartera
    const rolesPorCartera = {};
    const permisosUnificados = {};
    
    rolesUsuario.forEach(rol => {
      // Agrupar roles por cartera
      if (!rolesPorCartera[rol.id_cartera]) {
        rolesPorCartera[rol.id_cartera] = {
          id_cartera: rol.id_cartera,
          nombre_cartera: rol.nombre_cartera,
          roles: []
        };
      }
      rolesPorCartera[rol.id_cartera].roles.push({
        id_rol: rol.id_rol,
        nombre_rol: rol.nombre_rol,
        permisos: rol.permisos
      });

      // Unificar permisos (si tiene true en algún rol, queda true)
      if (rol.permisos) {
        const permisos = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : rol.permisos;
        Object.entries(permisos).forEach(([key, value]) => {
          if (value === true) {
            permisosUnificados[key] = true;
          } else if (permisosUnificados[key] !== true) {
            permisosUnificados[key] = value;
          }
        });
      }
    });

    // Generar token JWT con roles
    const token = generateToken(user, rolesUsuario);

    logger.info('Login succeeded', { usuario: usuario, ip: req.ip, id: user.id_usuario, roles: rolesUsuario.length });
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_usuario,
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        estado: user.estado,
        roles: rolesUsuario,
        rolesPorCartera: Object.values(rolesPorCartera),
        permisos: permisosUnificados,
        carteras: [...new Set(rolesUsuario.map(r => r.id_cartera))]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login' });
  }
};

/**
 * POST /usuarios/register
 */
exports.register = async (req, res) => {
  try {
    const { usuario, password, nombre, apellido, correo, telefono } = req.body;

    // Validar datos requeridos
    if (!usuario || !password || !nombre || !apellido || !correo) {
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }

    // Validar contraseña
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    // Verificar unicidad de usuario
    const existingUser = await sequelize.query(sql.getUsuarioByUsuario, {
      replacements: { usuario },
      type: QueryTypes.SELECT
    });
    if (existingUser.length) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Verificar unicidad de correo
    const existingEmail = await sequelize.query(
      'SELECT * FROM usuarios WHERE correo = :correo',
      {
        replacements: { correo },
        type: QueryTypes.SELECT
      }
    );
    if (existingEmail.length) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await argon2.hash(password);
    const token = crypto.randomBytes(32).toString('hex');

    const [result] = await sequelize.query(sql.createUsuario, {
      replacements: {
        usuario,
        password_hash: hashedPassword,
        nombre,
        apellido,
        correo,
        telefono
      },
      type: QueryTypes.INSERT
    });

    // Enviar correo de confirmación
    try {
      await sendConfirmationEmail(correo, nombre, result.toString());
    } catch (emailErr) {
      console.error('Error enviando correo:', emailErr);
      // No hacer rollback aquí, el usuario se creó pero no se pudo enviar email
    }

    res.status(201).json({
      message: 'Usuario registrado, revisa tu email para confirmar',
      id: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

/**
 * GET /usuarios/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const usuarios = await sequelize.query(sql.getUsuarioById, {
      replacements: { id: req.user.id },
      type: QueryTypes.SELECT
    });

    if (!usuarios.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = usuarios[0];
    res.json({
      id: user.id_usuario,
      usuario: user.usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      estado: user.estado,
      fecha_crea: user.fecha_crea
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};