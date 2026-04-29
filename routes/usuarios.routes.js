// routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarios.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los usuarios (requiere autenticación)
router.get('/', authenticateToken, ctrl.getAll);

// Crea un nuevo usuario (público - para registro)
router.post('/', ctrl.create);

// Actualiza un usuario existente (requiere autenticación)
router.patch('/:id', authenticateToken, requirePermission('editar_usuarios'), ctrl.update);

// Elimina un usuario (requiere autenticación y rol admin)
router.delete('/:id', authenticateToken, requirePermission('eliminar_usuarios'), ctrl.remove);

// Confirma un usuario (público)
router.post('/confirmar/:token', ctrl.confirm);
router.get('/confirmar/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const id = parseInt(token, 10);
    if (isNaN(id)) return res.status(400).send('Token inválido');

    await require('../controllers/usuarios.controller').confirm(req, res);
  } catch (err) {
    res.status(500).send('Error al confirmar');
  }
});

// Obtiene un usuario por ID (requiere autenticación)
router.get('/:id', authenticateToken, ctrl.getById);

module.exports = router;
