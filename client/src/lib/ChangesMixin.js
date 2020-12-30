import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import camelCase from 'lodash/camelCase'
import fromPairs from 'lodash/fromPairs'
import flatten from 'lodash/flatten'

export default ({
  recordKeys = [] // List of keys of records on the vm that changes are applied to and tracked for
}) => {
  recordKeys = (!Array.isArray(recordKeys) ? [recordKeys] : recordKeys).filter(v => !!v)

  const mixin = {
    data () {
      return {
        change$: []
      }
    },
    methods: {
      clearChanges (recordKey) {
        if (typeof recordKey === 'function') {
          this.change$ = this.change$.filter(recordKey)
        } else if (recordKey) {
          this.change$ = this.change$.filter(c => c.recordKey !== recordKey)
        } else {
          this.change$ = []
        }
        this.$emit('changes', this.allChanges)
      },
      handleChange (recordKey, path, value) {
        const changes = this.change$.filter(c => !(c.recordKey === recordKey && c.path === path))
        if (!isEqual(get(this[recordKey], path), value) && (get(this[recordKey], path) || '') !== (value || '')) {
          changes.push({ recordKey, path, value })
        }
        this.change$ = changes
        this.$emit('changes', this.allChanges)
      },
      revertChange (recordKey, path) {
        this.change$ = this.change$.filter(c => !(c.recordKey === recordKey && c.path === path))
        this.$emit('changes', this.allChanges)
      }
    },
    computed: {
      allChanges () {
        return this.change$
      },
      ...fromPairs(flatten(recordKeys.map(recordKey => {
        return [
          [
            camelCase(`${recordKey}_changes`),
            function () {
              return this.change$.filter(change => change.recordKey === recordKey)
            }
          ],
          [
            camelCase(`${recordKey}_changed`),
            function () {
              const record = cloneDeep(this[recordKey] || (Array.isArray(this[recordKey]) ? [] : {}))
              this[camelCase(`${recordKey}_changes`)].forEach(change => {
                set(record, change.path, change.value)
              })
              return record
            }
          ]
        ]
      })))
    }
  }

  return mixin
}
