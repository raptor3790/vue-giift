
module.exports = {
  up: async (knex) => {
    await knex.raw(`CREATE TABLE tokens (
      id SERIAL PRIMARY KEY,
      token VARCHAR(80) NOT NULL,
      client_id VARCHAR(10) NOT NULL,
      user_id INTEGER references users,
      scopes VARCHAR(255),
      hits INTEGER DEFAULT 0,
      expires_at TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      last_seen_at TIMESTAMP WITHOUT TIME ZONE
    )`)
    await knex.raw('CREATE UNIQUE INDEX token_unique ON tokens(token)')
    await knex.schema.table('tokens', (t) => t.index(['expires_at']))
    await knex.schema.table('tokens', (t) => t.index(['last_seen_at']))
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists('tokens')
  }
}
