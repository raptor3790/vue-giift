const getStripe = require('./getStripe')

// Pass in stripe customer id and amount IN CENTS
module.exports = async ({ customerId, amount, description }) => {
  const stripe = await getStripe()

  const charge = await stripe.charges.create({
    amount,
    currency: 'usd',
    customer: customerId,
    ...(description ? { statement_descriptor_suffix: description.substr(0, 22) } : {})
  })

  return charge
}
