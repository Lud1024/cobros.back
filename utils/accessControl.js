const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

const ADMIN_ROLE = 'Administrador';

const toNumberList = (values = []) => [...new Set(
  values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
)];

const isAdmin = (user) => {
  const roles = user?.roles || [];
  return roles.some((rol) => rol.nombre_rol === ADMIN_ROLE);
};

const getUserCarteras = async (user) => {
  if (!user?.id) return [];

  const tokenCarteras = toNumberList(user.carteras || []);
  if (tokenCarteras.length) return tokenCarteras;

  const rows = await sequelize.query(
    `SELECT DISTINCT id_cartera
     FROM usuario_roles
     WHERE id_usuario = :id_usuario
       AND id_cartera IS NOT NULL`,
    {
      replacements: { id_usuario: user.id },
      type: QueryTypes.SELECT
    }
  );

  return toNumberList(rows.map((row) => row.id_cartera));
};

const getScope = async (user) => ({
  isAdmin: isAdmin(user),
  userId: user?.id || null,
  carteraIds: await getUserCarteras(user)
});

const buildCarteraCondition = (scope, alias = 'c') => {
  if (scope.isAdmin) return { clause: '1=1', replacements: {} };
  if (!scope.carteraIds.length) return { clause: '1=0', replacements: {} };

  return {
    clause: `${alias}.id_cartera IN (:scope_carteras)`,
    replacements: { scope_carteras: scope.carteraIds }
  };
};

const buildPaymentUserCondition = (scope, alias = 'p') => {
  if (scope.isAdmin) return { clause: '1=1', replacements: {} };

  return {
    clause: `${alias}.id_usuario_registro = :scope_user_id`,
    replacements: { scope_user_id: scope.userId }
  };
};

module.exports = {
  buildCarteraCondition,
  buildPaymentUserCondition,
  getScope,
  isAdmin
};
