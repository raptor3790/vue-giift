module.exports = {
  user: process.env.DB_USERNAME || 'giift',
  password: process.env.DB_PASSWORD || 'giift',
  database: process.env.DB_NAME || 'giift',
  host: process.env.DB_HOSTNAME || 'localhost',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL ? true : null
}
