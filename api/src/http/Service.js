const Koa = require('koa')

const bodyParser = require('koa-bodyparser')
const nunjucksRender = require('koa-nunjucks-async')
const cookie = require('koa-cookie').default
const json = require('koa-json')
const path = require('path')

const routes = require('./routes')
const middleware = require('./middleware')
const Sentry = require('@sentry/node')

class HttpService {
  async start () {
    const port = process.env.HTTP_PORT || 3000
    this.app = new Koa()
    this.app.proxy = true

    this.app.use(cookie())
    this.app.use(bodyParser({
      formLimit: '5mb',
      jsonLimit: '5mb'
    }))
    this.app.use(json({ pretty: false, param: 'pretty' }))

    this.app.use(nunjucksRender(path.join(__dirname, './views'), {
      opts: {
        autoescape: true,
        noCache: process.env.NODE_ENV !== 'production'
      }
    }))

    middleware(this) // Set up all global middleware
    this.router = routes.createRouter() // Set up all routers
    this.app.use(this.router.routes())

    this.app.on('error', err => {
      const ignorableError = err.expose && !(err.statusCode && err.statusCode >= 500)
      // Only log if it's an important error or we're local
      if (!ignorableError || process.env.NODE_ENV === 'local') {
        console.error(err)
      }
      if (ignorableError) {
        return
      }
      if (process.env.SENTRY_URL) {
        Sentry.captureException(err)
      }
    })

    this.server = await new Promise((resolve, reject) => {
      const server = this.app.listen(port, function (err) {
        if (err) {
          return reject(err)
        }
        resolve(server)
      })
    })

    this.server.setTimeout(300000)

    console.log('API started on port ' + port)
  }

  async shutdown (signal) {
    const promises = []
    if (signal === 'SIGINT' && process.env.NODE_ENV === 'production' && !process.env.APP_PREVENT_DRAIN) {
      // Wait 20 seconds before shutting down http to give load balancer a chance to remove this target
      // and have connections drain.
      // promises.push(new Promise(resolve => setTimeout(resolve, 20000)))
    }

    // Wait for server to completely stop
    promises.push(new Promise((resolve) => {
      // 180 second failsafe
      const timeout = setTimeout(() => {
        console.log('API: http server failed to drain, possible long-running request')
        resolve()
      }, 180 * 1000)
      this.server.close(() => {
        clearTimeout(timeout)
        resolve()
      })
    }))
    await Promise.all(promises)
    console.log('API shutdown complete')
  }
}

module.exports = HttpService
