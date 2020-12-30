
module.exports = {
  up: async (knex) => {
    await knex.raw(`CREATE TABLE funds (
      id INTEGER PRIMARY KEY DEFAULT nextval('global_id_seq'),
      user_id INTEGER references users,
      amount NUMERIC(10, 2),
      meta JSONB,
      available_at TIMESTAMP WITHOUT TIME ZONE,
      requested_at TIMESTAMP WITHOUT TIME ZONE,
      captured_at TIMESTAMP WITHOUT TIME ZONE,
      delivered_at TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      created_by INTEGER references users,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      updated_by INTEGER references users
    )`)
    // Delivered at indicates that the fund has been delivered and another can be started
    // SO, only one fund per user at a time that hasn't been delivered
    await knex.raw('CREATE UNIQUE INDEX funds_one_active_per_user ON funds(user_id) WHERE captured_at IS NULL')
    await knex.raw('CREATE UNIQUE INDEX funds_unique ON funds(user_id, id)')
    await knex.schema.table('funds', (t) => t.index(['requested_at', 'captured_at']))
    await knex.schema.table('funds', (t) => t.index(['captured_at']))
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists('funds')
  }
}
