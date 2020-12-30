require('dotenv').config()
// Default ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.TZ = 'UTC'

if (process.env.NODE_ENV === 'local') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

let debug = require('debug')
// VSCODE debugging
if (process.env.VSCODE_PID) {
  debug.log = console.info.bind(console)
}
debug = debug('app:root')

const moment = require('moment-timezone')
moment.tz.setDefault('UTC')
const knex = require('knex')

const Sentry = require('@sentry/node')

if (process.env.SENTRY_URL) {
  Sentry.init({
    dsn: process.env.SENTRY_URL,
    beforeSend: (event, hint) => {
      const error = hint.originalException

      // Only send error to sentry if NONE of the following
      const errorMessage = `${error.name || ''}: ${error.message || ''}`
      if (
        errorMessage.includes('boring error')
      ) {
        return null
      }
      return event
    }
  })
}

const AppServices = {}
// RUN_SERVICES options: HTTP, WORKER
// Leave blank for all when running in local mode or for 'QUEUE' when in production mode
process.env.APP_SERVICES = process.env.APP_SERVICES || 'HTTP,WORKER'

if (process.env.APP_SERVICES.toUpperCase().split(',').includes('WORKER')) {
  const WorkerServiceProvider = require('_src/worker/Service')
  AppServices.worker = new WorkerServiceProvider()
}

if (process.env.APP_SERVICES.toUpperCase().split(',').includes('HTTP')) {
  const HttpServiceProvider = require('_src/http/Service')
  AppServices.http = new HttpServiceProvider()
}

const start = async () => {
  if ((process.env.DB_RUN_MIGRATIONS || '') + '' === 'true') {
    const dbConfig = require('_src/db/config')
    console.log('DB Migrations Started')
    await knex(dbConfig).migrate.latest()
    console.log('DB Migrations Complete')
  }

  // Eventually "await" this when startup is async
  await Promise.all(Object.entries(AppServices).map(([key, service]) => service.start()))

  console.log('App started in', process.env.NODE_ENV, 'mode')
}

start()

const eventNames = ['SIGTERM', 'SIGINT']
eventNames.forEach((eventName) => {
  process.on(eventName, async (sig) => {
    process.env.APP_SHUTTING_DOWN = true
    console.log('\n' + eventName + ' signal received.  Waiting up to 180 sec for current jobs to finish.')
    try {
      await Promise.all(Object.values(AppServices).map((AppService) => AppService.shutdown(eventName)))
      // Disconnect Database
      console.log('App Shutdown complete')
    } catch (e) {
      console.log('App Shutdown error', e)
    }
    process.exit(0)
  })
})

process.on('uncaughtException', async (err) => {
  console.error('uncaughtException: ', err)
  if (process.env.SENTRY_URL) {
    Sentry.captureException(err)
  }
})

process.on('unhandledRejection', async err => {
  console.error('unhandledRejection: ', err)
  if (process.env.SENTRY_URL) {
    Sentry.captureException(err)
  }
})
