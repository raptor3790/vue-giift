const debug = require('debug')('app:http:middleware:request')
const get = require('lodash/get')
// const omit = require('lodash/omit')

// const ignoredHeaders = [
//   'connection',
//   'content-length',
//   'accept-encoding',
//   'accept-language',
//   'cookie',
//   'accept',
//   'authorization',
//   'postman-token',
//   'cache-control',
//   'pragma',
//   'content-type',
//   'x-amzn-trace-id',
//   'x-forwarded-port',
//   'x-forwarded-proto',
//   'x-forwarded-for'
// ]

module.exports = async (ctx, next) => {
  const start = process.hrtime()
  // const startAt = new Date()
  let error
  try {
    await next()
  } catch (e) {
    error = e
  }
  const diff = process.hrtime(start)
  const dt = diff[0] * 1e3 + diff[1] * 1e-6
  ctx.set('X-Response-Time', `${dt}ms`)
  ctx.set('X-Powered-By', 'Giift')
  ctx.set('X-Server-Id', (get(process, 'pid') || '') + '')
  ctx.set('X-Req-Hostname', ctx.request.hostname)
  debug(ctx.request.method.toUpperCase() + ': ' + ctx.request.url, dt)

  // if (!ctx.preventHttpLog) { // Temporary until no more sensitive data is sent in the body of request
  //   let headers = omit(
  //     get(ctx.request, 'headers', {}),
  //     ignoredHeaders
  //   )
  //   let request = {
  //     length: ctx.request.length || undefined,
  //     url: ctx.request.path,
  //     body: (get(ctx.request, 'body') && Object.entries(ctx.request.body).length) ? ctx.request.body : undefined,
  //     query: (get(ctx.request, 'query') && Object.entries(ctx.request.query).length) ? ctx.request.query : undefined,
  //     params: (ctx.params && Object.entries(ctx.params).length) ? ctx.params : undefined,
  //     headers: (headers && Object.entries(headers).length) ? headers : undefined
  //   }

  //   Object.keys(request).forEach(key => {
  //     if (typeof request[key] === 'object') {
  //       request[key] = mongoEscape.escape(request[key])
  //     }
  //   })

  //   let response = {
  //     length: ctx.response.length,
  //     body: ctx.body
  //   }

  //   Object.keys(response).forEach(key => {
  //     if (typeof response[key] === 'object') {
  //       response[key] = mongoEscape.escape(response[key])
  //     }
  //   })

  //   let log = {
  //     account_id: get(ctx.state, 'account.id'),
  //     client_id: get(ctx.state, 'client.id'),
  //     user_id: get(ctx.state, 'user') ? ctx.state.user.id : undefined,
  //     method: ctx.request.method,
  //     path: get(ctx.routeConfig, '1') || ctx.request.path,
  //     ip: ctx.request.get('x-forwarded-for') || ctx.request.ip,
  //     request,
  //     response,
  //     at: startAt,
  //     dt: Math.round(dt),
  //     status: ctx.response.status
  //   }

  //   if (error) {
  //     log.debug = error.message + ' ---' + error.stack
  //     if (typeof error.getHttpStatusCode === 'function') {
  //       log.status = error.getHttpStatusCode()
  //     }
  //   }

  //   // 14 megs to be conservative
  //   if (((log.request.length || 0) + (log.request.length || 0)) > 15 * 1000 * 1000) {
  //     if (log.request.length > 1000000) {
  //       log.request.body = '**too long**'
  //     }
  //     if (log.response.length > 1000000) {
  //       log.response.body = '**too long**'
  //     }
  //   }

  //   await HttpLog.create(log)
  // }

  if (error) {
    // debug('ERROR', error)
    if (error && error.message && error.message.includes('duplicate key')) {
      debug(error)
      ctx.throw(400, 'A record like that already exists')
    } else {
      throw error
    }
  }
}
