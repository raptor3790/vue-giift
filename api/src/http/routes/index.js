const Router = require('koa-router')
const get = require('lodash/get')
const gate = require('_src/http/middleware/gate')

exports.createRouter = () => {
  const router = new Router()

  const routes = exports.buildRouteList(router)

  routes.forEach(route => {
    let methods = route[0]
    if (!Array.isArray(methods)) {
      methods = [methods]
    }
    const pattern = route[1]
    const handler = route[2]
    const options = route[3] || {}
    let params = [pattern]
    // Ensure routeConfig is on ctx for all middleware to see
    params.push((ctx, next) => {
      ctx.routeConfig = route
      return next()
    })
    if (get(options, 'middleware')) {
      let middleware = options.middleware
      if (!Array.isArray(middleware)) {
        middleware = [middleware]
      }
      params = params.concat(middleware)
    }
    params = params.concat(async (ctx) => {
      await gate(ctx, async () => {
        const result = await handler(ctx)
        if (!get(options, 'raw') && !ctx.raw && !ctx.body) {
          ctx.body = result
        }
      })
    })

    // Create a route for each method (supports methods being an array)
    methods.forEach(method => {
      router[method.toLowerCase()].apply(router, params)
    })
  })

  return router
}

exports.buildRouteList = (router) => {
  return [
    ...require('./auth').routes(router),
    ...require('./funds').routes(router),
    ...require('./pledges').routes(router),
    ...require('./users').routes(router),
    ...require('./client').routes(router)
  ]
}
