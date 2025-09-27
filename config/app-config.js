require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  limit: 5,

  offset: 0,

  SortBy: 'created_at',

  OrderBy: 'DESC',
};
