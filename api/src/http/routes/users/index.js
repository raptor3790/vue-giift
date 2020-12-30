const User = require('_src/models/User')
const addStripeSource = require('_src/lib/addStripeSource')
const createError = require('http-errors')

exports.routes = (router) => {
  return [
    // ['GET', '/api/v1/users', exports.list, { gate: { user: true } }],
    ['GET', '/api/v1/users/:id', exports.get, { gate: { user: true } }],
    ['PATCH', '/api/v1/users/:id', exports.update, { gate: { user: true } }]
  ]
}

exports.list = async (ctx) => {
  return {
    hi: 'there'
  }
}

exports.get = async (ctx) => {
  const query = User
    .query()
    .whereNotDeleted()
    .findById(ctx.params.id)

  const data = await query
  if (!data) {
    ctx.throw(404)
  }

  return { data: data.$filterFields(ctx) }
}

// exports.create = async (ctx) => {
//   const data = ctx.request.body
//   const record = new User()
//   await record.$fillFromRequest(data, ctx)
//   return User.createRecord(record, ctx)
// }

exports.update = async (ctx) => {
  const record = await User.query().whereNotDeleted().findById(ctx.params.id)
  if (record.id + '' !== ctx.state.user.id + '') {
    ctx.throw(403)
  }

  const data = ctx.request.body

  await record.$fillFromRequest(data, ctx)

  if (record.birthday === '') {
    record.birthday = null // temporary
  }

  try {
    if (data && data.stripe_source_id) {
      await addStripeSource(record, data.stripe_source_id)
    }
  } catch (e) {
    throw createError(400, e)
  }

  await record.$updateRecord(ctx)
  return exports.get(ctx)
}
