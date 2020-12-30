module.exports = async ({ app }) => {
  app.use(require('./healthy'))

  app.use(require('./request'))

  app.use(require('./auth').handler)
}
