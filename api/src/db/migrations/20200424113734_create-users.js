
module.exports = {
  up: async (knex) => {
    await knex.raw(`CREATE TABLE users (
      id INTEGER PRIMARY KEY DEFAULT nextval('global_id_seq'),
      phone VARCHAR(20),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      birthday DATE,
      email VARCHAR(255),
      password VARCHAR(255),
      meta JSONB,
      stats JSONB,
      payment_source JSONB,
      last_seen_at TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITHOUT TIME ZONE
    )`)
    await knex.raw('CREATE UNIQUE INDEX users_phone_unique ON users(phone) WHERE deleted_at IS NULL')
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists('users')
  }
}
