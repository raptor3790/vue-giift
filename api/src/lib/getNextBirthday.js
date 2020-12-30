const moment = require('moment-timezone')

module.exports = (birthday) => {
  if (!birthday) {
    return null
  }
  const m = moment(birthday).utc().year(moment().year())
  if (m.isBefore(moment())) {
    m.add(1, 'year')
  }
  return m
}
