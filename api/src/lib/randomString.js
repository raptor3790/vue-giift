const range = require('lodash/range')
const random = require('lodash/random')

const randomString = (
  length = 1,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) => {
  return range(0, length)
    .map(() => chars[Math.floor(random(0, chars.length - 1))])
    .join('')
}

module.exports = randomString
