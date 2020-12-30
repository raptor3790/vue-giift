const User = require('_src/models/User')
const get = require('lodash/get')

module.exports = async (ctx, next) => {
  switch (ctx.path) {
    case '/healthy':
      if (process.env.APP_SHUTTING_DOWN) {
        ctx.status = 503
        ctx.body = { healthy: false }
      }
      try {
        // Just run a query so we know it's working
        const user = await User.query().first()
        ctx.body = {
          healthy: true,
          id: get(user, 'id')
        }
      } catch (e) {
        ctx.status = 500
        ctx.body = { healthy: false }
      }
      return
  }

  await next()
}
