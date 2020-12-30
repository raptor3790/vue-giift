const throttle = require('_src/http/middleware/throttle')
const get = require('lodash/get')
const set = require('lodash/set')
const MessageLog = require('_src/models/MessageLog')
const Pledge = require('_src/models/Pledge')
const User = require('_src/models/User')
const Token = require('_src/models/Token')
const random = require('lodash/random')
const pinTemplate = require('_src/templates/pin')
const moment = require('moment-timezone')
const authMiddleware = require('_src/http/middleware/auth')

exports.routes = () => {
  return [
    ['GET', '/api/v1/auth', exports.initialState, { gate: { user: true } }],
    ['POST', '/api/v1/auth/pin', exports.pin, { middleware: [throttle(3, 60)], public: true }],
    ['POST', '/api/v1/auth', exports.auth, { middleware: [throttle(3, 60)], public: true }],
    ['DELETE', '/api/v1/auth', exports.destroy]
  ]
}

const cleanPhone = (phone) => {
  phone = phone.replace(/\D/g, '')
  if (phone.length === 10) {
    phone = `1${phone}`
  }
  return phone
}

exports.pin = async (ctx) => {
  const phone = cleanPhone(get(ctx, 'request.body.phone') || '')
  if (phone.length !== 11) {
    ctx.throw(400, 'Invalid Phone Number')
  }

  const rawPin = random(100000, 999999) + ''
  // let pin = rawPin.split('')
  // pin.splice(3, 0, '-')
  // pin = pin.join('')
  const pin = rawPin // Since there's no dash on the phone keyboard
  // When Vuetify supports better masking I'll add this back

  let token = Token.fromJson({
    token: `${phone}-${rawPin}`,
    client_id: 'WEB',
    expires_at: moment().add(5, 'minutes').toISOString()
  })
  token = await Token.createRecord(token, ctx)

  let messageLog
  try {
    messageLog = await MessageLog.sendSms({
      to: phone,
      text: pinTemplate(pin)
    })
  } catch (e) {
    if (e.message.includes('number')) {
      ctx.throw(400, e.message)
    }
    throw e
  }

  return {
    tid: token.id,
    mid: get(messageLog, 'id'),
    ...(['local', 'development'].includes(process.env.NODE_ENV) ? { rawPin } : {}) // temporary
  }
}

exports.auth = async (ctx) => {
  const phone = cleanPhone(get(ctx, 'request.body.phone') || '')
  if (phone.length !== 11) {
    ctx.throw(400, 'Invalid Phone Number')
  }
  const pin = (get(ctx, 'request.body.pin') || '').replace(/\D/g, '')

  const checkToken = await Token.query()
    .where('token', `${phone}-${pin}`)
    .whereRaw('( expires_at IS NULL OR expires_at > Now() )')
    .first()
  if (!checkToken) {
    ctx.throw(400, 'Invalid phone number or PIN')
  }

  // Find or create the user

  let user = await User.query()
    .whereNotDeleted()
    .where('phone', phone)
    .first()

  if (!user) {
    user = new User()
    await user.$fillFromRequest({
      ...ctx.request.body,
      phone
    }, ctx)
    user = await User.createRecord(user, ctx)
  }

  await User.query().where('id', user.id).patch({ last_seen_at: moment().toISOString() })

  // If the user is signing up with a pledge
  if (get(ctx, 'request.body.pledge_id')) {
    const pledge = await Pledge.query().findById(ctx.request.body.pledge_id)
    if (pledge && !pledge.to_user_id) {
      await pledge.activateForUser(user)
    }
  }

  // Generate the token
  const token = await Token.generate({
    client_id: 'WEB',
    user_id: user.id
  })

  await checkToken.$deleteRecord(ctx)

  authMiddleware.createAuthCookie(ctx, token.token, moment(token.expires_at).toDate())

  return exports.initialState({
    state: {
      user,
      token
    }
  })
}

// Return everything that might be needed to get post-auth loaded
// This returns everything the user will need to display their dashboard in a
// simple format that can be consumed by VuexORM
exports.initialState = async (ctx) => {
  const pledges = require('_src/http/routes/pledges')
  const funds = require('_src/http/routes/funds')

  const initialState = {
    tid: get(ctx, 'state.token.id')
  }

  if (ctx.state.user) {
    const pledgesResult = await pledges.list(ctx)
    initialState.records = pledgesResult.records
    set(initialState, 'records.pledges', [
      ...(get(initialState, 'records.pledges') || []),
      ...pledgesResult.data
    ])
    set(initialState, 'records.users', [
      ...(get(initialState, 'records.users') || []),
      ctx.state.user.$filterFields(ctx)
    ])
    set(initialState, 'state.userId', ctx.state.user.id)
    set(initialState, 'records.funds', (await funds.list(ctx)).data)
  }

  if (ctx.state.initialPledge) {
    const fromUser = await User.query().findById(ctx.state.initialPledge.from_user_id)

    set(initialState, 'records.pledges', [
      ...(get(initialState, 'records.pledges') || []),
      ctx.state.initialPledge.$filterFields(ctx)
    ])
    set(initialState, 'state.initialPledgeId', ctx.state.initialPledge.id)
    set(initialState, 'records.users', [
      ...(get(initialState, 'records.users') || []),
      fromUser.$filterFields(ctx)
    ])
  }

  return initialState
}

exports.destroy = async (ctx) => {
  authMiddleware.destroyAuthCookie(ctx)
  return {}
}
