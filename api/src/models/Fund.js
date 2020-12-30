const Model = require('./Model')

class Fund extends Model {
  static get tableName () {
    return 'funds'
  }

  static fillableFields (ctx) {
    return ['requested_at']
  }
}

module.exports = Fund.initialize()
