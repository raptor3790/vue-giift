
module.exports = {
  up: async (knex) => {
    await knex.raw(`CREATE TABLE message_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER references users,
      "to" VARCHAR(50) NOT NULL,
      "from" VARCHAR(50) NOT NULL,
      content JSONB,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    )`)
    await knex.schema.table('message_log', (t) => t.index(['to']))
    await knex.schema.table('message_log', (t) => t.index(['from']))
    await knex.schema.table('message_log', (t) => t.index(['created_at']))
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists('message_log')
  }
}
