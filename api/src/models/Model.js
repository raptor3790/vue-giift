const Objection = require('objection')
const get = require('lodash/get')
const omit = require('lodash/omit')
const pick = require('lodash/pick')
// const softDelete = require('_src/db/softDelete')
// softDelete.register(Objection)
const softDelete = require('_src/db/softDelete')
// const debug = require('debug')('app:models:Model')

// DB Config
const dbConfig = require('_src/db/config')
const knex = require('knex')(dbConfig)

class LModel extends Objection.Model {
  static initialize () {
    return this
  }

  static fields (DataTypes) {
    return {}
  }

  static fillableFields (ctx) {
    return []
  }

  static restrictedFields (ctx) {
    return ['id', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
  }

  bumpCreatedAt () {
    const timestamps = this.constructor.timestamps()
    if (timestamps === true || get(timestamps, 'created_at')) {
      const key = typeof timestamps.created_at === 'string' ? timestamps.created_at : 'created_at'
      this[key] = new Date().toISOString()
    }
  }

  bumpUpdatedAt () {
    const timestamps = this.constructor.timestamps()
    if (timestamps === true || get(timestamps, 'updated_at')) {
      const key = typeof timestamps.updated_at === 'string' ? timestamps.updated_at : 'updated_at'
      this[key] = new Date().toISOString()
    }
  }

  static async beforeCreate (record, queryContext) { }

  static async beforeUpdate (record, queryContext) { }

  static async beforeSave (record, queryContext) { }

  static async beforeDelete (record, queryContext) { }

  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    await this.constructor.beforeCreate(this, queryContext)
    await this.constructor.beforeSave(this, queryContext)
    if (this.constructor.timestamps() && !queryContext.skipTimestamps) {
      this.bumpCreatedAt()
      this.bumpUpdatedAt()
    }
  }

  async $beforeUpdate (opt, queryContext) {
    if (opt.old === undefined) {
      // Do nothing since these methods are specific for instances and this isn't an instance if opt.old is undefined
      return
    }
    await super.$beforeUpdate(opt, queryContext)

    if (this.constructor.isSoftDelete && this.deleted_at) {
      await this.constructor.beforeDelete(this, {
        ...opt,
        ...queryContext
      })
      return
    }
    await this.constructor.beforeUpdate(this, {
      ...opt,
      ...queryContext
    })
    await this.constructor.beforeSave(this, {
      ...opt,
      ...queryContext
    })
    if (this.constructor.timestamps() && !queryContext.skipTimestamps) {
      this.bumpUpdatedAt()
    }
  }

  async $beforeDelete (context) {
    await super.$beforeDelete(context)
    await this.constructor.beforeDelete(this, context)
  }

  static async afterCreate (record, queryContext) { }

  static async afterUpdate (record, queryContext) { }

  static async afterSave (record, queryContext) { }

  static async afterDelete (record, queryContext) { }

  async $afterInsert (queryContext) {
    await super.$afterInsert(queryContext)
    await this.constructor.afterCreate(this, queryContext)
    await this.constructor.afterSave(this, queryContext)
  }

  async $afterUpdate (opt, queryContext) {
    if (opt.old === undefined) {
      // Do nothing since these methods are specific for instances and this isn't an instance if opt.old is undefined
      return
    }
    await super.$afterUpdate(opt, queryContext)
    if (this.constructor.isSoftDelete && this.deleted_at) {
      await this.constructor.afterDelete(this, {
        ...opt,
        ...queryContext
      })
      return
    }
    await this.constructor.afterUpdate(this, {
      ...opt,
      ...queryContext
    })
    await this.constructor.afterSave(this, {
      ...opt,
      ...queryContext
    })
  }

  async $afterDelete (context) {
    await super.$afterDelete(context)
    await this.constructor.afterDelete(this, context)
  }

  static get userFields () {
    return false
  }

  static timestamps () {
    return true
  }

  static withSoftDelete (options) {
    return softDelete(options)(this)
  }

  // Return everything by default
  static filterFields (record, ctx) {
    return record
  }

  // Removes any secure fields for a particular context
  $filterFields (ctx = null) {
    return this.constructor.filterFields(this, ctx)
  }

  $formatJson (json) {
    json = super.$formatJson(json)
    return this.constructor.filterFields(json)
  }

  static async requestFilter (data, ctx) {
    const restrictedFields = this.restrictedFields(ctx)
    if (restrictedFields.length) {
      data = omit(data, restrictedFields)
    }

    const fillable = this.fillableFields(ctx)

    if (!fillable.length) {
      const error = new Error('This record cannot be modified')
      if (ctx && ctx.throw) {
        ctx.throw(400, error.message)
      } else {
        throw error
      }
    }

    if (!(fillable.includes('*'))) {
      data = pick(data, fillable)
    }

    return data
  }

  async $fillFromRequest (data, ctx) {
    data = await this.constructor.requestFilter(data, ctx)

    this.$set(data)
  }

  static async createRecord (data, ctx, { transaction } = {}) {
    if (this.userFields && ctx && ctx.state && ctx.state.user && ctx.state.user.id) {
      data.created_by = ctx.state.user.id
      data.updated_by = ctx.state.user.id
    }
    const record = await this.query(transaction).context({ ctx }).insert(data)
    return record
  }

  async $updateRecord (ctx, { transaction } = {}) {
    if (this.constructor.userFields && ctx && ctx.state && ctx.state.user && ctx.state.user.id) {
      this.updated_by = ctx.state.user.id
    }
    return this.$query(transaction).context({ ctx }).patch(this)
  }

  async $deleteRecord (ctx, { transaction } = {}) {
    if (!this.constructor.isSoftDelete) {
      await this.$query().context({ ctx }).delete()
      return
    }
    let extraFields
    if (this.constructor.userFields && ctx && ctx.state && ctx.state.user && ctx.state.user.id) {
      extraFields = { deleted_by: ctx.state.user.id }
    }
    await this.$query(transaction).context({ ctx }).delete(extraFields, ctx)
  }
}

LModel.knex(knex)

module.exports = LModel
