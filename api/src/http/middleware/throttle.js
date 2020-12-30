const { RateLimiterMemory } = require('rate-limiter-flexible')

// Request
module.exports = (maxRequests, duration = 60) => {
  const rateLimiter = new RateLimiterMemory({
    points: maxRequests,
    duration
  })
  return async (ctx, next) => {
    try {
      await rateLimiter.consume(ctx.ip)
    } catch (rejRes) {
      ctx.status = 429
      ctx.body = 'Too Many Requests'
      return
    }

    await next()
  }
}
