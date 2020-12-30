const Model = require('./Model')
const moment = require('moment-timezone')
const randomString = require('_src/lib/randomString')

class Token extends Model {
  static get tableName () {
    return 'tokens'
  }

  static get userFields () {
    return false
  }

  static timestamps () {
    return false
  }

  static generate (props = {}) {
    const record = this.fromJson(props)

    record.token = ((props.user_id ? `U${props.user_id}_` : '') + randomString(60)).substr(0, 60)
    record.expires_at = moment().add(90, 'days').toISOString()

    return this.query().insert(record)
  }
}

module.exports = Token.initialize()
