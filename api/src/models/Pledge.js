const Model = require('./Model')
const randomString = require('_src/lib/randomString')
const createError = require('http-errors')
const moment = require('moment-timezone')
const round = require('lodash/round')

class Pledge extends Model.withSoftDelete() {
  static get tableName () {
    return 'pledges'
  }

  static fillableFields (ctx) {
    return ['amount', 'name']
  }

  static async beforeSave (record, context) {
    if (!record.id) {
      let existing
      do {
        record.id = randomString(9)
        existing = await this.query().findById(record.id)
      } while (existing)
    }
  }

  async activateForUser (user) {
    if (this.from_user_id + '' === user.id + '') {
      throw createError(400, 'You cannot activate your own pledge.')
    }
    if (this.to_user_id) {
      if (user.id + '' === this.to_user_id + '') {
        // Do nothing
      } else {
        throw createError(400, 'This pledge has already been activated for another user')
      }
    }

    // Ensure this user has a fund and add the pledge to it
    const fund = await user.getOrCreateFund()

    this.to_user_id = user.id
    this.fund_id = fund.id

    await this.$updateRecord()
  }

  async charge (ctx) {
    if (this.meta && this.meta.charge_id) {
      throw createError(400, 'This pledge has already been charged')
    }
    if (!((this.amount * 1) > 0)) {
      throw createError(400, 'Pledge amount is 0')
    }
    const User = require('_src/models/User')
    const Fund = require('_src/models/Fund')
    const chargeStripeCustomer = require('_src/lib/chargeStripeCustomer')
    if (!this.fund_id) {
      throw createError(400, 'Pledge is not associated with a fund')
    }
    const fund = await Fund.query().findById(this.fund_id)
    if (!fund) {
      throw createError(400, 'Associated fund does not exist')
    }
    if (fund.captured_at) {
      throw createError(400, 'Fund has already been marked as captured.')
    }
    const fromUser = this.from_user_id ? await User.query().findById(this.from_user_id) : null
    const toUser = this.to_user_id ? await User.query().findById(this.to_user_id) : null
    if (!fromUser) {
      throw createError(400, 'User to charge could not be found.')
    }
    if (!toUser) {
      throw createError(400, 'User to give to could not be found.')
    }
    if (!(fromUser.payment_source && fromUser.payment_source.stripe_customer_id)) {
      throw createError(400, 'User does not have a payment source.')
    }

    let amount = this.amount * 100 // In cents
    const merchantFee = round(amount * 0.029 + 30)
    amount = round(amount + merchantFee)

    let charge
    try {
      charge = await chargeStripeCustomer({
        customerId: fromUser.payment_source.stripe_customer_id,
        amount: amount,
        description: ((toUser.first_name || '') + ' ' + (toUser.last_name || '')).trim()
      })

      this.meta = {
        ...(this.meta || {}),
        charge_id: charge.id,
        charged_at: moment().toISOString(),
        merchant_fee: merchantFee
      }

      if (this.meta.charge_error !== 'undefined') {
        delete this.meta.charge_error
      }
    } catch (e) {
      this.meta = {
        ...(this.meta || {}),
        charge_error: e.message,
        charged_at: moment().toISOString()
      }
    }

    await this.$updateRecord(ctx)
    // Also update the fund with how much has been charged
    await Fund.knex().raw(`update funds f
      set amount = coalesce(p.total_amount, 0)
      FROM
      (
        select coalesce(SUM(amount), 0) as total_amount
        from pledges
        where fund_id = ? and deleted_at is null and (meta->'charge_id') is not null
      ) p
      where f.id = ?`, [fund.id, fund.id])

    return charge
  }
}

module.exports = Pledge.initialize()
