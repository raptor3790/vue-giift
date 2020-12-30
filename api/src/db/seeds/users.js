exports.records = [
  { id: 1, phone: '18882223333', first_name: 'Michael', last_name: 'Scott', birthday: '1971-04-12', email: 'm.scott@dundermifflin.com' }
]

exports.model = 'User'

exports.seed = async (knex) => {
  await knex('users').whereIn('id', exports.records.map(r => r.id)).delete()
  await knex('users').insert(exports.records)
}
