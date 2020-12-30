
module.exports = {
  up: async (knex) => {
    await knex.raw(`CREATE TABLE pledges (
      id VARCHAR(12) PRIMARY KEY,
      from_user_id INTEGER references users,
      to_user_id INTEGER references users,
      fund_id INTEGER references funds,
      FOREIGN KEY (to_user_id, fund_id) REFERENCES funds(user_id, id),
      name VARCHAR(255),
      amount NUMERIC(9, 2),
      meta JSONB,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITHOUT TIME ZONE
    )`)
    // Only allow 1 pledge from each user per fund
    await knex.raw('CREATE UNIQUE INDEX pledges_unique ON pledges(fund_id, from_user_id) WHERE deleted_at IS NULL')
    await knex.schema.table('pledges', (t) => t.index(['from_user_id']))
    await knex.schema.table('pledges', (t) => t.index(['to_user_id']))
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists('pledges')
  }
}
