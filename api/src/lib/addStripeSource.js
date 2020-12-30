const getStripe = require('./getStripe')
const get = require('lodash/get')

module.exports = async (user, sourceId) => {
  const stripe = await getStripe()

  const source = await stripe.sources.retrieve(sourceId)

  const customerId = get(user, 'payment_source.stripe_customer_id')

  let customer
  if (customerId) {
    customer = await stripe.customers.retrieve(customerId)
  }

  const customerData = {
    phone: user.phone,
    email: user.email,
    description: `User ${user.id}`,
    name: `${user.first_name} ${user.last_name}`
    // metadata: {
    // }
  }

  // If no customer, create one
  if (customer) {
    customer = await stripe.customers.update(customer.id, customerData)
  } else {
    customer = await stripe.customers.create(customerData)
  }

  await stripe.customers.createSource(
    customer.id,
    {
      source: source.id
    }
  )

  user.payment_source = {
    stripe_customer_id: customer.id,
    stripe_source_id: source.id,
    card: source.card,
    valid: true
  }
}
