const credentials = require('./credentials')
const path = require('path')

module.exports = {
  client: 'postgresql',
  connection: credentials,
  migrations: {
    directory: path.join(__dirname, '/migrations'),
    tableName: 'migrations'
  },
  seeds: {
    directory: path.join(__dirname, '/seeds')
  },
  pool: {
    afterCreate: function (connection, callback) {
      connection.query('SET timezone = "UTC";', function (err) {
        callback(err, connection)
      })
    }
  }
}
