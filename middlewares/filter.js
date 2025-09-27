const { Sequelize, Op } = require('sequelize');
const config = require('../config/app-config');

/**
 * Validates a column name to prevent injection attacks
 * Supports nested associations like company.department.name
 * @param {string} name
 * @returns {boolean}
 */
const isValidColumn = (name) =>
  /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(name);

/**
 * Builds Sequelize literal for nested columns
 * "role.code" => Sequelize.literal('"role"."code"')
 * @param {string} column
 */
const buildOrderLiteral = (column) => {
  if (!column.includes('.')) return column;
  const parts = column.split('.');
  return Sequelize.literal(parts.map((p) => `"${p}"`).join('.'));
};

/**
 * Build Sequelize sorting (order) array
 * Supports multi-column, nested columns, default fallbacks
 */
const buildSorting = (sortBy, orderBy) => {
  const columns = (sortBy || config.SortBy).split(',').filter(Boolean);
  const orders = (orderBy || config.OrderBy).split(',').filter(Boolean);

  return columns
    .map((col, i) => {
      if (!isValidColumn(col)) return null;
      const direction = (orders[i] || orders[0] || 'ASC').toUpperCase();
      if (!['ASC', 'DESC'].includes(direction)) return null;
      return [buildOrderLiteral(col), direction];
    })
    .filter(Boolean);
};

/**
 * Build Sequelize where condition from operator, column, value
 */
const buildCondition = (operator, column, value) => {
  if (value === '' || value === undefined || value === null) {
    return {};
  }
  const col = column.includes('.') ? `$${column}$` : column;

  switch (operator) {
    case 'PMin':
      return { [col]: { [Op.gte]: parseFloat(value) } };
    case 'PMax':
      return { [col]: { [Op.lte]: parseFloat(value) } };
    case 'PEqual':
      return { [col]: { [Op.eq]: value } };
    case 'PNotEqual':
      return { [col]: { [Op.ne]: value } };
    case 'PLike':
      return { [col]: { [Op.like]: `%${value}%` } };
    case 'PILike':
      return { [col]: { [Op.iLike]: `%${value}%` } };
    case 'PIn':
      return { [col]: { [Op.in]: value.split(',') } };
    case 'PNotIn':
      return { [col]: { [Op.notIn]: value.split(',') } };
    case 'PDateMin':
      return { [col]: { [Op.gte]: new Date(value) } };
    case 'PDateMax':
      return { [col]: { [Op.lte]: new Date(value) } };
    case 'PDateEqual':
      return { [col]: { [Op.eq]: new Date(value) } };
    case 'PBetween': {
      const [min, max] = value.split(',');
      if (min && max)
        return { [col]: { [Op.between]: [parseFloat(min), parseFloat(max)] } };
      break;
    }
    case 'PNotBetween': {
      const [min, max] = value.split(',');
      if (min && max)
        return {
          [col]: { [Op.notBetween]: [parseFloat(min), parseFloat(max)] },
        };
      break;
    }
    default:
      return { [col]: { [Op.eq]: value } };
  }
};

/**
 * Middleware: parses query params into Sequelize where, order, limit, offset, language
 */
const generateFilterMiddleware = (req, res, next) => {
  try {
    const filters = req.query;
    const andConditions = [];
    const orConditions = [];

    // Pagination
    const offset = filters.offset ? parseInt(filters.offset) : config.offset;
    const limit = filters.limit ? parseInt(filters.limit) : config.limit;

    // Sorting
    const order = buildSorting(filters.sort_by, filters.order_by);

    // Language
    const language = filters.language
      ? filters.language.toUpperCase()
      : config.defaultReturnedLanguage;

    req.queryOptions = { offset, limit, order, language };

    // Ignore special keys
    const ignoreKeys = ['offset', 'limit', 'sort_by', 'order_by', 'language'];

    Object.keys(filters).forEach((key) => {
      if (ignoreKeys.includes(key)) return;

      const isOr = key.startsWith('OR_');
      const operatorKey = isOr ? key.replace('OR_', '') : key;
      const underscoreIndex = operatorKey.indexOf('_');

      let operator = 'PEqual';
      let column = operatorKey;
      const value = filters[key];

      if (underscoreIndex > 0 && operatorKey.startsWith('P')) {
        operator = operatorKey.substring(0, underscoreIndex);
        column = operatorKey.substring(underscoreIndex + 1);
      }

      if (!isValidColumn(column)) return;

      const condition = buildCondition(operator, column, value);
      if (Object.keys(condition).length > 0) {
        isOr ? orConditions.push(condition) : andConditions.push(condition);
      }
    });

    const where = {};
    if (andConditions.length) where[Op.and] = andConditions;
    if (orConditions.length) where[Op.or] = orConditions;

    req.filterConditions = where;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = generateFilterMiddleware;
