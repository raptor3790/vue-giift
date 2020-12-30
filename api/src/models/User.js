const Model = require('./Model')
const Fund = require('./Fund')
const getNextBirthday = require('_src/lib/getNextBirthday')
const get = require('lodash/get')
const pick = require('lodash/pick')

const fundQuery = (user) => {
  return Fund.query()
    .where('user_id', user.id)
    .whereNull('captured_at')
    .first()
}

const getAvailableAt = (user) => {
  if (!(user && user.birthday)) {
    return null
  }
  return getNextBirthday(user.birthday).toISOString()
}

class User extends Model.withSoftDelete() {
  static get tableName () {
    return 'users'
  }

  static filterFields (record, ctx) {
    if (get(ctx, 'state.user.id') + '' === record.id + '' || get(ctx, 'state.user.meta.admin')) {
      return pick(record, ['id', 'phone', 'first_name', 'last_name', 'birthday', 'email', 'payment_source', 'meta'])
    }
    return pick(record, ['id', 'first_name', 'last_name', 'birthday'])
  }

  static fillableFields (ctx) {
    return ['phone', 'email', 'first_name', 'last_name', 'birthday']
  }

  static async afterSave (record, context) {
    if (record.birthday) {
      // Get next birthday and set the current fund's available date to that birthday
      await fundQuery(record)
        .patch({
          available_at: getAvailableAt(record)
        })
    }
  }

  async getOrCreateFund () {
    let fund = await fundQuery(this)

    if (!fund) {
      fund = new Fund()
      fund.$set({
        user_id: this.id,
        available_at: getAvailableAt(this)
      })

      fund = await Fund.createRecord(fund)
    }

    return fund
  }
}

module.exports = User.initialize()
