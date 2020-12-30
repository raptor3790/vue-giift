<template>
  <div>
    <v-container
      pa-6
      class="wrapper"
    >
      <!-- title -->
      <p class="h3 t-bold text-center">
        Hey {{ userChanged.first_name }} 👋
      </p>
      <p class="text-center px-4">
        You can edit your account information below.
      </p>

      <!-- first name -->
      <v-row
        no-gutters
        align="end"
      >
        <v-col>
          <p class="label form-label mt-3">first name</p>
          <v-text-field
            v-if="edit.first_name"
            label="first name"
            placeholder="i.e. Eugene"
            outlined
            solo
            flat
            dense
            hide-details
            color="#E9E9E9"
            background-color="white"
            :value="userChanged.first_name"
            :disabled="usersLoading"
            @input="handleChange('user', 'first_name', $event)"
          />
          <div
            v-else
            class="t-medium"
          >
            {{ user.first_name }}
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn
            v-if="!edit.first_name"
            text
            color="primary"
            class="t-medium pa-0 v-btn--compact"
            @click="edit.first_name = true"
          >edit</v-btn>
        </v-col>
      </v-row>

      <!-- last name -->
      <v-row
        no-gutters
        align="end"
      >
        <v-col>
          <p class="label form-label">last name</p>
          <v-text-field
            v-if="edit.last_name"
            label="last name"
            placeholder="i.e. Levy"
            outlined
            solo
            flat
            dense
            hide-details
            color="#E9E9E9"
            background-color="white"
            :value="userChanged.last_name"
            :disabled="usersLoading"
            @input="handleChange('user', 'last_name', $event)"
          />
          <div
            v-else
            class="t-medium"
          >
            {{ user.last_name }}
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn
            v-if="!edit.last_name"
            text
            color="primary"
            class="t-medium pa-0 v-btn--compact"
            @click="edit.last_name = true"
          >edit</v-btn>
        </v-col>
      </v-row>

      <!-- phone number -->
      <v-row
        no-gutters
        align="end"
      >
        <v-col>
          <p class="label form-label">phone number</p>
          <v-text-field
            v-if="edit.phone"
            type="tel"
            label="phone number"
            placeholder="i.e. 555-555-5555"
            outlined
            solo
            flat
            dense
            hide-details
            color="#E9E9E9"
            background-color="white"
            :value="userChanged.phone"
            :disabled="usersLoading"
            :error="!validPhone"
            @input="handleChange('user', 'phone', $event)"
          />
          <div
            v-else
            class="t-medium"
          >
            {{ user.phone }}
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn
            v-if="!edit.phone"
            text
            color="primary"
            class="t-medium pa-0 v-btn--compact"
            @click="edit.phone = true"
          >edit</v-btn>
        </v-col>
      </v-row>

      <!-- payment source -->
      <v-row
        no-gutters
        align="end"
      >
        <v-col>
          <p class="label form-label">payment source</p>
          <div class="t-medium">
            {{ paymentSourceName }}
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn
            text
            color="primary"
            class="t-medium pa-0 v-btn--compact"
            @click="paymentSourceDialog = true"
          >edit</v-btn>
        </v-col>
      </v-row>

      <!-- birthday -->
      <v-row
        no-gutters
        align="end"
      >
        <v-col>
          <p class="label form-label">birthday</p>
          <div class="t-medium primary--text">
            {{ moment(userChanged.birthday).utc().format('MMM Do, YY') }}
          </div>
        </v-col>
        <v-col cols="auto" class="text-center" style="width: 36px;">
          <v-icon color="primary">mdi-lock</v-icon>
        </v-col>
      </v-row>

      <p class="text-center mx-4 mt-3 f-s">Fat fingered your birthday?  Shoot us a note and we'll fix it</p>
    </v-container>

    <v-container
      text-center
      class="bottom-fixed wrapper"
    >
      <v-btn
        rounded
        color="primary"
        block
        large
        :disabled="usersLoading || !userChanges.length || !validPhone"
        @click="save"
      >Save
      </v-btn>
    </v-container>

    <a-footer padding="1" />

    <payment-source-dialog
      v-if="paymentSourceDialog"
      @close="paymentSourceDialog = false"
      @success="paymentSourceDialog = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.form-label {
  margin-top: 16px;
  margin-left: 0px;
}
.v-btn--compact {
  height: 24px !important;
}
</style>

<script>
import AFooter from '@/components/Footer'
import { mapGetters } from 'vuex'
import ChangesMixin from '@/lib/ChangesMixin'
import { User } from '@/models'
import PaymentSourceDialog from './PaymentSourceDialog'
import get from 'lodash/get'

export default {
  mixins: [
    ChangesMixin({ recordKeys: ['user'] }),
    User.mixin()
  ],
  components: {
    AFooter,
    PaymentSourceDialog
  },
  data () {
    return {
      paymentSourceDialog: false,
      edit: {
        first_name: false,
        last_name: false,
        phone: false
      }
    }
  },
  computed: {
    ...mapGetters(['user']),
    paymentSourceName () {
      if (!(this.user && this.user.payment_source && this.user.payment_source.valid)) {
        return 'add'
      }
      const card = get(this.user, 'payment_source.card') || {}
      return `${card.brand} ${card.last4} -- Exp ${card.exp_month}/${card.exp_year}`
    },
    validPhone () {
      const phone = ((this.userChanged && this.userChanged.phone) || '').replace(/\D/g, '')
      if (phone.startsWith('1')) {
        return phone.length === 11
      } else {
        return phone.length === 10
      }
    }
  },
  methods: {
    async save () {
      if (this.usersLoading) {
        return
      }
      await this.usersSave(this.userChanged)
      this.clearChanges()
      this.$router.push({ name: 'Dashboard' })
    }
  }
}
</script>
