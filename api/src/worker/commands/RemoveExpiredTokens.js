const Token = require('_src/models/Token')

class RemoveExpiredTokens {
  static get schedule () {
    return { interval: 30 * 60 * 1000, preventOverlap: true }
  }

  static async handler () {
    await Token.query()
      .whereRaw('expires_at < Now()')
      .delete()
  }
}

module.exports = RemoveExpiredTokens
