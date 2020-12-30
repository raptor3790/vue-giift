const twilio = require('twilio')
const Model = require('./Model')
const debug = require('debug')('app:models:MessageLog')

class Message extends Model {
  static get tableName () {
    return 'message_log'
  }

  static timestamps () {
    return false
  }

  static async sendSms ({ to, text, ctx = null }) {
    const message = {
      to,
      from: process.env.TWILIO_SMS_NUMBER,
      content: {
        text
      }
    }

    debug('sendSms', message)

    if (process.env.TWILIO_ACCOUNT_SID) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        {
          lazyLoading: true
        }
      )

      const twilioMessage = await client.messages.create({
        from: process.env.TWILIO_SMS_NUMBER,
        to,
        body: text
      })

      message.content = {
        ...message.content,
        twilio_id: twilioMessage.sid
      }
    }

    let messageLog = this.fromJson(message)
    messageLog = await this.createRecord(messageLog, ctx)

    return messageLog
  }
}

module.exports = Message.initialize()
