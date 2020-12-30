const Stripe = require('stripe')

module.exports = async () => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
  stripe.setAppInfo({
    name: 'Giift',
    url: 'https://giift.app'
  })
  return stripe
}
