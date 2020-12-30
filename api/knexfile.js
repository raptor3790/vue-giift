require('dotenv').config()
const config = require('./src/db/config')

// Ben says: I don't like knexfiles and this is ONLY for making the CLI usable

module.exports = {
  development: config,
  [process.env.NODE_ENV || 'development']: config
}
