import { Model } from '@vuex-orm/core'
import jsonStableStringify from 'fast-json-stable-stringify'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import fromPairs from 'lodash/fromPairs'

const existingRequests = {}
window.existingRequests = existingRequests

const multiplexedRequests = {}

const reuseRequest = async ({ key, request, options = {} }) => {
  if (existingRequests[key] && !get(options, 'noReuse')) {
    return existingRequests[key]
  }
  existingRequests[key] = request()

  try {
    const result = await existingRequests[key]
    delete existingRequests[key]
    return result
  } catch (e) {
    delete existingRequests[key]
    throw e
  }
}

const multiplexRequest = async function ({ param, value, options = {} }) {
  const multiplexedRequestKey = `${this.entity}-fetchMany-${param}`
  let multiplexedRequest = multiplexedRequests[multiplexedRequestKey]
  if (!multiplexedRequest) {
    multiplexedRequest = multiplexedRequests[multiplexedRequestKey] = {
      param,
      values: [],
      $promise: (async () => {
        // Give it multiplexTimeout ms to add more requests
        await new Promise(resolve => setTimeout(resolve, this.multiplexTimeout))
        // Delete this first so requests made while this is running will create a new request
        delete multiplexedRequests[multiplexedRequestKey]
        await this.api().request({
          method: 'GET',
          url: `/${this.entity}?${multiplexedRequest.param}=${multiplexedRequest.values.join(',')}`,
          dataKey: 'data',
          ...((options && options.request) || {})
        })
      })()
    }
  }

  multiplexedRequest.values = uniq([...multiplexedRequest.values, value])
  return multiplexedRequest.$promise
}

class MModel extends Model {
  // The amount of time to wait for other requests if options.multiplex === true
  static multiplexTimeout = 250

  // Eventually I can see this method accepting an id or an object of params
  static async fetchOne (id, options = {}) {
    const existingRecord = this.find(id)
    if (existingRecord && !get(options, 'force')) {
      return existingRecord
    }

    // The ability to have the request wait a period of time for any other multiplexed
    // Rather than requesting /:entity/:id it will instead request /:entity?id=1,2,3
    if (get(options, 'multiplex')) {
      const multiplexResult = await multiplexRequest.call(this, {
        param: 'id',
        value: id,
        options
      })
      return multiplexResult
    }

    return reuseRequest({
      key: `${this.entity}-fetchOne-${id}`,
      request: () => this.api().request({
        method: 'GET',
        url: `/${this.entity}/${id}`,
        ...(options.request || {})
      }),
      options
    })
  }

  static async fetchMany (requestOptions = {}, options = {}) {
    // The ability to have the request wait a period of time for any other multiplexed
    // Rather than requesting /:entity/:id it will instead request /:entity?id=1,2,3
    if (get(options, 'multiplex')) {
      if (Object.entries(requestOptions.params).length !== 1) {
        throw new Error('There can only be one parameter on a multiplexed request')
      }
      return multiplexRequest.call(this, {
        param: Object.keys(requestOptions.params)[0],
        value: Object.values(requestOptions.params)[0]
      })
    }

    return reuseRequest({
      key: `${this.entity}-fetchMany-${jsonStableStringify(requestOptions)}`,
      request: () => this.api().request({
        method: 'GET',
        url: `/${this.entity}`,
        dataKey: 'data',
        ...requestOptions
      }),
      options
    })
  }

  static save (record, requestOptions = {}) {
    return this.api().request({
      method: record.id ? 'PATCH' : 'POST',
      url: `/${this.entity}${record.id ? '/' + record.id : ''}`,
      data: record,
      ...requestOptions
    })
  }

  static async destroy (recordOrId) {
    const id = typeof recordOrId === 'object' ? recordOrId.id : recordOrId
    const result = await this.api().request({
      method: 'DELETE',
      url: `/${this.entity}/${id}`
    })
    this.delete((r) => {
      return r.id + '' === id + ''
    })
    return result
  }

  // Override this to prevent deleteing all records upon account change
  static emptyForAccount () {
    this.deleteAll()
  }

  static forAccount (accountId) {
    if (accountId) {
      return this.query().where(r => r.account_id && r.account_id + '' === accountId + '')
    }
    return this.query()
  }

  static mixin () {
    if (!this.entity) {
      throw new Error('No entity defined')
    }
    const model = this
    const loadingKey = camelCase(`${model.entity}_loading`)
    const mixin = {
      data () {
        return {
          [loadingKey + 'count']: 0 // Increment & Decrement based on completed operations
        }
      },
      computed: {
        [loadingKey] () {
          return this[loadingKey + 'count'] > 0
        }
      },
      methods: {
        ...fromPairs(
          [
            'fetchOne',
            'fetchMany',
            'save',
            'destroy'
          ].map(modelMethod => [camelCase(`${model.entity}_${modelMethod}`), async function () {
            this[loadingKey + 'count']++
            try {
              const result = await model[modelMethod].apply(model, arguments)
              this[loadingKey + 'count']--
              return result
            } catch (e) {
              this[loadingKey + 'count']--
              throw e
            }
          }])
        )
      }
    }

    return mixin
  }
}

export default MModel
