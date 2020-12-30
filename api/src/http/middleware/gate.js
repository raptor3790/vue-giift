const get = require('lodash/get')

const testGate = async (gate, ctx) => {
  if (get(gate, 'user')) {
    if (!get(ctx.state, 'user.id')) {
      return { status: 401, message: 'requires user authentication' }
    }
  }

  return true
}

module.exports = async (ctx, next) => {
  let gates = get(ctx, 'routeConfig.3.gate')

  // If provided gates is an array, only one of them needs to pass
  if (!Array.isArray(gates)) {
    gates = [gates]
  }

  const results = await Promise.all(gates.map(gate => testGate(gate, ctx)))

  const passingResult = results.find(v => v === true)

  if (results.length && !passingResult) {
    let errorMessage
    let status = 403
    if (results.length === 1) {
      errorMessage = `This endpoint ${results[0].message}.`
      status = results[0].status || status
    } else {
      errorMessage = `This endpoint: (${results.join(' OR ')}).`
    }
    ctx.throw(status, errorMessage)
  }

  await next()
}
