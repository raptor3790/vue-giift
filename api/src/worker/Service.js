const cron = require('node-cron')
const debug = require('debug')('app:WorkerService')
const get = require('lodash/get')
const commands = [
  require('./commands/RemoveExpiredTokens')
]
const Sentry = require('@sentry/node')

class SchedulerService {
  async start () {
    await this.scheduleProcesses()
    console.log('Worker started')
  }

  async scheduleProcesses () {
    const scheduler = this
    this.isScheduled = true
    // Set up cron tasks
    this.cronCommands = []
    commands.filter((command) => command.schedule && command.schedule.cron).forEach((command) => {
      command.cronTask = cron.schedule(command.schedule.cron, async () => {
        if (!scheduler.isScheduled || (command.schedule.preventOverlap && command.running)) {
          return
        }
        const tNot = Date.now()
        command.running = true
        debug('[0 ms] CRON START:', command.name)
        try {
          await command.handler()
        } catch (e) {
          console.log('Error:', command.name, e)
          Sentry.captureException(e)
        }
        command.running = false
        debug(`[${Date.now() - tNot} ms] CRON FINISH:`, command.name)
      })
      this.cronCommands.push(command)
    })

    // Set up interval tasks
    // These tasks will repeat while the interval amount of time between executions
    // There should never be any overlap with these commands
    const commandCallDepths = {} // Track how many "urgent" calls there have been
    this.intervalCommands = []
    commands.filter((command) => command.schedule && command.schedule.interval).forEach((command) => {
      command.run = async () => {
        if (!scheduler.isScheduled) {
          return
        }
        const tNot = Date.now()
        if (command.running) {
          debug('command already running', command.name)
          return
        }
        command.running = true
        debug('[0 ms] INTERVAL START:', command.name)
        let result
        try {
          result = await command.handler()
        } catch (e) {
          console.log('Error:', command.name, e)
          Sentry.captureException(e)
        }
        let scheduleNextDelay
        try {
          if (get(result, 'urgent')) {
            scheduleNextDelay = get(result, 'delay') || 1000 // run quickly since there is more to do
            commandCallDepths[command.name] = (commandCallDepths[command.name] || 0) + 1
            if (commandCallDepths[command.name] >= 5000) {
              // This is protection from the system going crazy right now
              scheduleNextDelay = 120000
              commandCallDepths[command.name] = 0
            }
          }
        } catch (e) {
          debug('MAKING TASK URGENT FAILED', e)
          //
        }
        command.running = false
        command.scheduleNext(scheduleNextDelay)

        debug(`[${Date.now() - tNot} ms] INTERVAL FINISH:`, command.name)
      }

      command.scheduleNext = (intervalTime) => {
        clearTimeout(command.nextTimeout)
        command.nextTimeout = setTimeout(command.run, intervalTime || command.schedule.interval)
      }
      command.scheduleNext()
      this.intervalCommands.push(command)
    })
  }

  async unscheduleProcesses () {
    (this.cronCommands || []).forEach((command) => {
      try {
        command.cronTask.destroy()
      } catch (e) {
        debug(`Unable to stop scheduled process: ${command.name}`, e)
      }
    })
    debug('stopped cron commands:', this.cronCommands && this.cronCommands.length);
    (this.intervalCommands || []).forEach((command) => {
      try {
        clearTimeout(command.nextTimeout)
      } catch (e) {
        debug(`Unable to stop scheduled process: ${command.name}`, e)
      }
    })
    debug('stopped interval commands:', this.intervalCommands && this.intervalCommands.length)
  }

  async shutdown () {
    await this.unscheduleProcesses()
    clearInterval(this.managerInterval)
    console.log('Worker shutdown complete')
  }
}

module.exports = SchedulerService
