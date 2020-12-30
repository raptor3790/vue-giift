const axios = require('axios')
const cdnPath = 'https://s3.amazonaws.com/cdn.giift.app/client/latest/'

let cachedTemplate = null
const cacheTemplate = async () => {
  const response = await axios({
    url: `${cdnPath}index.html`,
    responseType: 'text'
  })
  cachedTemplate = response.data
}

// For now I'm not going to cache and see how this goes.
// if (process.env.NODE_ENV === 'production') {
//   // Cache the template every 30 seconds
//   setInterval(() => {
//     cacheTemplate()
//   }, 1 * 30 * 1000)
// }

module.exports = async () => {
  // For now I'm not going to cache and see how this goes.
  // if (!cachedTemplate || process.env.NODE_ENV !== 'production') {
  await cacheTemplate()
  // }
  return cachedTemplate
}
