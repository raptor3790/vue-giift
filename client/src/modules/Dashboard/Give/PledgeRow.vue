<template>
  <list-row class="my-3">
    <!-- title -->
    <span slot="title">{{ firstName }} {{ lastInitial }}</span>

    <!-- sub title -->
    <span slot="sub-title">
      <span v-if="birthday">{{ moment(birthday).utc().format('MMM Do') }} - </span>
      {{ pledgeStatus }}
    </span>

    <!-- buttons -->
    <slot
      v-if="$slots && $slots.right"
      name="right"
      slot="right"
    />
    <div v-else slot="right">
      <v-row
        no-gutters
        align="center"
        v-if="edit || (amount && !(value && value.id))"
      >
        <!-- delete -->
        <v-btn
          icon
          v-if="incrementDown === null"
          :disabled="loading"
          @click="$emit('delete')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <!-- plus, minus -->
        <v-btn
          v-else
          text
          class="h1 t-regular px-0 v-btn--compact"
          :disabled="loading || incrementDown === null"
          @click="setAmount(incrementDown)"
        >-
        </v-btn>
        <span
          class="primary--text f-l t-bold mt-1 text-center"
          :style="incrementDown === null ? '' : 'min-width: 24px;'"
        >
          {{ amount }}
        </span>
        <v-btn
          text
          class="h1 t-regular px-0 v-btn--compact"
          :disabled="loading || incrementUp === null"
          @click="setAmount(incrementUp)"
        >+
        </v-btn>
      </v-row>

      <!-- amount -->
      <v-row
        no-gutters
        v-else-if="!amount || !(value && value.id)"
      >
        <v-btn
          v-for="increment in increments.filter(i => i > 0).slice(0, 3)"
          :key="'increment' + increment"
          fab
          small
          elevation="0"
          color="primary"
          class="ml-2 ml-sm-3 f-l"
          @click="setAmount(increment)"
        >${{ increment }}</v-btn>
      </v-row>

      <!-- text -->
      <v-row
        no-gutters
        v-else
      >
        <span class="primary--text t-bold">
          ${{ amount }}
        </span>
      </v-row>
    </div>
  </list-row>
</template>

<script>
import ListRow from '@/components/ListRow'
import get from 'lodash/get'
import { Pledge } from '@/models'
import { mapGetters } from 'vuex'

export default {
  components: {
    ListRow
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    edit: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['user']),
    increments () {
      return [0, 5, 10, 20]
    },
    incrementDown () {
      const downValue = this.increments.filter(i => i < this.amount).reverse()[0]
      if (!downValue && downValue !== 0) {
        return null
      }
      return downValue
    },
    incrementUp () {
      return this.increments.filter(i => i > this.amount)[0] || null
    },
    amount () {
      if (['', null, undefined].includes(this.value.amount)) {
        return null
      }
      return 1 * this.value.amount
    },
    firstName () {
      if (get(this.value, 'to_user.first_name')) {
        return get(this.value, 'to_user.first_name')
      }
      const nameParts = (get(this.value, 'name') || '').split(' ')
      // Remove last name
      if (nameParts.length > 1) {
        nameParts.pop()
      }
      return nameParts.join(' ') || '?'
    },
    lastName () {
      if (get(this.value, 'to_user.last_name')) {
        return get(this.value, 'to_user.last_name')
      }
      const nameParts = (get(this.value, 'name') || '').split(' ')
      return nameParts.length > 1 ? nameParts.pop() : ''
    },
    lastInitial () {
      return (this.lastName || '').substr(0, 1)
    },
    birthday () {
      return get(this.value, 'to_user.birthday')
    },
    pledgeStatus () {
      // If this pledge doesn't have a to_user_id then the user hasn't joined giift yet or accepted this pledge
      if (!get(this.value, 'to_user_id')) {
        return 'Hasn\'t accepted yet'
      }
      if (this.theirPledgeToMe) {
        return 'Pledged to your fund'
      }
      return 'Accepted your pledge'
    },
    theirPledgeToMe () {
      if (get(this.value, 'to_user_id')) {
        return Pledge.query().where(p => p.from_user_id + '' === this.value.to_user_id + '' && p.to_user_id + '' === this.user.id + '').first()
      }
      return null
    }
  },
  methods: {
    setAmount (value) {
      this.$emit('change', { path: 'amount', value })
      this.$emit('input', value)
    }
  }
}
</script>
