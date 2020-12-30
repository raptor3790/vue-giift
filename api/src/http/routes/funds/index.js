const Fund = require('_src/models/Fund')
const get = require('lodash/get')
const pick = require('lodash/pick')
const Pledge = require('_src/models/Pledge')
const User = require('_src/models/User')
const moment = require('moment-timezone')

exports.routes = (router) => {
  return [
    ['GET', '/api/v1/funds', exports.list, { gate: { user: true } }],
    ['PATCH', '/api/v1/funds/:id', exports.patch, { gate: { user: true } }]
  ]
}

// Returns a list of all pledges to/from the user for funds that have not been delivered
exports.list = async (ctx) => {
  const query = Fund.query()

  const records = {}
  let data = []
  // Let admins see all funds and also return all pledge/user records associated with funds
  if (get(ctx.request, 'query.admin') && get(ctx.state.user, 'meta.admin')) {
    data = await query
      .whereRaw(
        'available_at IS NOT NULL AND available_at < ? AND (delivered_at IS NULL OR delivered_at > ?)',
        [
          moment().add(1, 'month').toISOString(),
          moment().subtract(7, 'days').toISOString()
        ]
      ).orderBy('available_at')
    // Add records for pledges and users
    records.pledges = await Pledge.query().whereNotDeleted().whereIn('fund_id', data.map(d => d.id))
    records.pledges = records.pledges.map(p => p.$filterFields(ctx))
    records.users = await User.query().whereIn('id',
      data.map(fund => fund.user_id)
        .concat(records.pledges.map(p => p.from_user_id))
    )
    records.users = records.users.map(u => u.$filterFields(ctx))
  } else {
    data = await query.where('user_id', ctx.state.user.id)
  }

  return { data, records }
}

exports.patch = async (ctx) => {
  // Admins only
  if (!(ctx.state.user.meta && ctx.state.user.meta.admin)) {
    ctx.throw(403)
  }

  const fund = await Fund.query().findById(ctx.params.id)
  if (!fund) {
    ctx.throw(404)
  }

  if (ctx.request.body) {
    fund.captured_at = ctx.request.body.captured_at
    fund.delivered_at = ctx.request.body.delivered_at
    fund.meta = {
      ...(fund.meta || {}),
      ...pick(ctx.request.body.meta, ['amount_paid'])
    }
  }
  await fund.$updateRecord(ctx)

  return { data: fund }
}
