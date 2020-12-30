const Pledge = require('_src/models/Pledge')
const User = require('_src/models/User')
const Fund = require('_src/models/Fund')
const get = require('lodash/get')
const pick = require('lodash/pick')
const throttle = require('_src/http/middleware/throttle')

exports.routes = (router) => {
  return [
    ['GET', '/api/v1/pledges', exports.list, { gate: { user: true } }],
    ['GET', '/api/v1/pledges/:id', exports.get, { middleware: [throttle(3, 60)], public: true }],
    ['POST', '/api/v1/pledges/:id/charge', exports.chargePledge, { gate: { user: true } }],
    ['POST', '/api/v1/pledges', exports.create, { gate: { user: true } }],
    ['PATCH', '/api/v1/pledges/:id', exports.update, { gate: { user: true } }],
    ['DELETE', '/api/v1/pledges/:id', exports.delete, { gate: { user: true } }],
    ['GET', '/a/:pledgeId', exports.receivePledge]
  ]
}

// Returns a list of all pledges to/from the user for funds that have not been delivered
exports.list = async (ctx) => {
  const data = await Pledge.query()
    .whereNull('deleted_at')
    .leftJoin('funds', 'pledges.fund_id', 'funds.id')
    .whereRaw(`
      (pledges.to_user_id = ? OR pledges.from_user_id = ?) AND
      funds.captured_at IS NULL
    `, [ctx.state.user.id, ctx.state.user.id])

  const fromUserIds = data.map(p => p.from_user_id)
  const toUserIds = data.map(p => p.to_user_id)
  const userIds = fromUserIds.concat(toUserIds)

  return {
    data: data.map(p => p.$filterFields(ctx)),
    records: {
      users: (await User.query().whereIn('id', userIds)).map(u => u.$filterFields(ctx))
    }
  }
}

exports.get = async (ctx) => {
  const data = await Pledge.query().whereNotDeleted().findById(ctx.params.id)

  // This is only needed for dev mode...
  if (!ctx.state.user) {
    if (!data || data.to_user_id) {
      ctx.throw(404, 'That pledge could not be found.')
    }
  } else if (ctx.state.user && !(data && [data.to_user_id, data.from_user_id].includes(ctx.state.user.id))) {
    ctx.throw(404)
  }

  return {
    data: data.$filterFields(ctx),
    records: {
      users: (await User.query().where('id', data.from_user_id))
        .map(u => u.$filterFields(ctx))
    }
  }
}

exports.create = async (ctx) => {
  // If a to_user_id is provided, look for an existing pledge
  let pledge
  let fund
  if (get(ctx, 'request.body.to_user_id')) {
    const user = await User.query().findById(ctx.request.body.to_user_id)
    if (!user) {
      ctx.throw(400, 'Invalid user to pledge to')
    }
    fund = await user.getOrCreateFund()

    if (fund) {
      pledge = await Pledge.query()
        .whereNotDeleted()
        .where('from_user_id', ctx.state.user.id)
        .where('fund_id', fund.id)
        .first()
    }
  }

  if (pledge) {
    await pledge.$fillFromRequest(ctx.request.body, ctx)
    await pledge.$updateRecord(ctx)
  } else {
    pledge = new Pledge()
    pledge.from_user_id = ctx.state.user.id
    if (get(ctx, 'request.body.to_user_id')) {
      pledge.to_user_id = pledge.to_user_id || ctx.request.body.to_user_id
    }
    await pledge.$fillFromRequest(ctx.request.body, ctx)
    if (get(ctx.request.body, 'meta')) {
      pledge.meta = {
        ...(pledge.meta || {}),
        ...pick(ctx.request.body.meta, ['user_sent', 'sent_at', 'reciprocation', 'user'])
      }
    }
    if (fund) {
      pledge.fund_id = fund.id
    }
    pledge = await Pledge.createRecord(pledge, ctx)
  }

  return exports.get({
    ...ctx,
    params: {
      id: pledge.id
    }
  })
}

exports.update = async (ctx) => {
  const pledge = (await exports.get(ctx)).data

  if (pledge.from_user_id !== ctx.state.user.id) {
    ctx.throw(403)
  }

  pledge.$fillFromRequest(ctx.request.body, ctx)
  if (get(ctx.request.body, 'meta')) {
    pledge.meta = {
      ...(pledge.meta || {}),
      ...pick(ctx.request.body.meta, ['user_sent', 'sent_at', 'reciprocation', 'user'])
    }
  }
  await pledge.$updateRecord(ctx)

  return exports.get(ctx)
}

exports.delete = async (ctx) => {
  const pledge = (await exports.get(ctx)).data

  if (pledge.from_user_id !== ctx.state.user.id) {
    ctx.throw(403)
  }

  await pledge.$deleteRecord(ctx)
}

// Loads a pledge by the id.
// If the pledge does not exist then it just redirects back to home
// If pledge has already been activated by another user it will throw an error
// If pledge has already been activated by logged in user then redirect to /activated/:pledgeId
// If pledge can be activated
//   - if user is logged in, activate the pledge and then redirect to /activated/:pledgeId
//   - otherwise, redirect to /start/:pledgeId
exports.receivePledge = async (ctx) => {
  const pledge = await Pledge.query()
    .whereNotDeleted()
    .findById(ctx.params.pledgeId)

  if (!pledge) {
    ctx.redirect('/')
    return
  }

  // Mark this pledge as clicked as long as this isn't the sending user
  if (!(ctx.state.user && ctx.state.user.id + '' === pledge.from_user_id)) {
    pledge.meta = {
      ...(pledge.meta || {}),
      clicked: true
    }
    await pledge.$updateRecord(ctx)
  }

  if (ctx.state.user) {
    if (pledge.from_user_id + '' === ctx.state.user.id + '') {
      // Don't let a user activate their own pledge
      ctx.redirect('/dashboard')
      return
    }
    if (!pledge.to_user_id) {
      await pledge.activateForUser(ctx.state.user)
    }
    if (pledge.to_user_id && pledge.to_user_id + '' === ctx.state.user.id + '') {
      ctx.redirect(`/activated/${pledge.id}`)
      return
    } else {
      ctx.redirect('/?pledge_invalid=true')
      return
    }
  }
  ctx.redirect(`/start/${pledge.id}`)
}

exports.chargePledge = async (ctx) => {
  if (!(ctx.state.user.meta && ctx.state.user.meta.admin)) {
    ctx.throw(403)
  }

  const pledge = await Pledge.query().findById(ctx.params.id)
  if (!pledge) {
    ctx.throw(400, 'Pledge not found')
  }
  if (pledge.deleted_at) {
    ctx.throw(400, 'This pledge has been deleted')
  }

  await pledge.charge(ctx)

  return {
    data: pledge,
    records: {
      funds: await Fund.query().where('id', pledge.fund_id)
    }
  }
}
