const get = require('lodash/get')
const User = require('_src/models/User')
const Token = require('_src/models/Token')
const moment = require('moment-timezone')
const createError = require('http-errors')

exports.cookieName = 'gft'

exports.createAuthCookie = (ctx, token, expires) => {
  ctx.cookies.set(exports.cookieName, token, {
    expires,
    httpOnly: true,
    overwrite: true,
    domain: ctx.hostname,
    secure: ctx.protocol === 'https'
  })
}

exports.destroyAuthCookie = (ctx) => {
  ctx.cookies.set(exports.cookieName, '', {
    expires: moment().toDate(),
    httpOnly: true,
    overwrite: true,
    domain: ctx.hostname,
    secure: ctx.protocol === 'https'
  })
}

exports.handler = async (ctx, next) => {
  let tokenString = get(ctx.request, 'query.token') ? 'Bearer ' + get(ctx.request, 'query.token') : ctx.request.get('Authorization')

  let cookieToken = false
  if (!tokenString && ctx.cookies.get(exports.cookieName)) {
    tokenString = 'Bearer ' + ctx.cookies.get(exports.cookieName)
    cookieToken = true
  }

  const state = await exports.getState({
    tokenString,
    cookieToken,
    ctx
  })

  ctx.state = Object.assign(
    ctx.state || {},
    state
  )

  await next()
}

exports.getState = async ({
  tokenString = '',
  cookieToken,
  ctx = {}
}) => {
  // Data stored in context state
  let token
  let user

  if (tokenString) {
    if (tokenString.startsWith('Bearer ')) {
      token = await Token.query()
        .patch({
          last_seen_at: moment().utc().toDate(),
          hits: Token.knex().raw('hits + 1')
        })
        .where({ token: tokenString.replace('Bearer ', '') })
        .whereRaw('( expires_at IS NULL OR expires_at > Now() )')
        .returning('*')
        .first()
    }

    // If a cookie token was provided that is invalid, get rid of it.
    // Only throw an invalid token error if it's an API request
    if (!token) {
      if (cookieToken) {
        exports.destroyAuthCookie(ctx)
      } else {
        throw createError(401, 'Invalid token')
      }
    }
  }

  if (token) {
    if (token.user_id) {
      user = await User.query()
        .whereNotDeleted()
        .patch({ last_seen_at: moment().utc().toDate() })
        .returning('*')
        .findById(token.user_id)

      if (!user) {
        throw createError(401, 'Invalid Token (2)')
      }
    }
  }

  return {
    token,
    user
  }
}
