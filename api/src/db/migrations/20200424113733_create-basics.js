
module.exports = {
  up: async (knex) => {
    await knex.raw('SET TIME ZONE \'UTC\';')
    await knex.raw('ALTER USER giift SET timezone=\'UTC\'')
    await knex.raw(`CREATE SEQUENCE IF NOT EXISTS global_id_seq START ${process.env.NODE_ENV === 'production' ? '10000' : '50'}`)
  },
  down: async (knex) => {
    await knex.raw('DROP SEQUENCE IF EXISTS global_id_seq')
  }
}
