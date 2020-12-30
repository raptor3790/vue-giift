<template>
  <v-container
    text-center
    px-10
    py-6
    class="wrapper"
  >
    <p class="h3 t-bold">Hey there 👋</p>
    <form @submit.prevent="submit">
      <div v-if="!pinSent">
        <p>Please enter the phone number you used to create your account.</p>
        <p class="label form-label">phone number</p>
        <v-text-field
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
          v-model="phone"
          :disabled="loading"
          autofocus
        />

        <v-btn
          type="submit"
          rounded
          color="primary"
          block
          large
          class="mt-10"
          :disabled="loading || !validPhone"
        >Send PIN
        </v-btn>
      </div>
      <div v-else>
        <p>Please enter the 6 digit pin we just sent to your phone number.</p>
        <p class="label form-label">pin number</p>
        <v-text-field
          type="tel"
          label="pin number"
          placeholder="i.e. 555-533"
          outlined
          solo
          flat
          dense
          hide-details
          color="#E9E9E9"
          background-color="white"
          v-model="pin"
          :disabled="loading"
          autofocus
        />

        <v-btn
          type="submit"
          rounded
          color="primary"
          block
          large
          class="mt-10"
          :disabled="loading || !validPin"
        >Login
        </v-btn>
        <v-btn
          v-if="!loading"
          text
          color="primary"
          large
          class="mt-2"
          :disabled="loading"
          @click="pinSent = false"
        >Back
        </v-btn>
      </div>
    </form>

    <a-footer/>
  </v-container>
</template>

<script>
import AFooter from '@/components/Footer'

import { mapMutations, mapGetters, mapActions } from 'vuex'
import axios from 'axios'

export default {
  components: {
    AFooter
  },
  data () {
    return {
      loading: false,
      phone: '',
      pin: '',
      pinSent: false
    }
  },
  computed: {
    ...mapGetters(['user', 'initialPledge']), // This will either be a user record or newUser
    validPhone () {
      const phone = (this.phone || '').replace(/\D/g, '')
      if (phone.startsWith('1')) {
        return phone.length === 11
      } else {
        return phone.length === 10
      }
    },
    validPin () {
      return (this.pin || '').replace(/\D/g, '').length >= 6
    }
  },
  created () {
    // No need to authenticate if there is already a user id
    if (this.user && this.user.id) {
      return this.resolve()
    }

    this.phone = (this.user && this.user.phone) || ''

    // If there's already a valid phone number, submit the form and request
    // the pin
    if (this.phone && this.validPhone) {
      this.submit()
    }
  },
  methods: {
    ...mapMutations(['setInitialState']),
    ...mapActions(['loadSession']),
    async submit () {
      if (this.loading) {
        return
      }
      this.loading = true
      try {
        if (!this.pinSent) {
          // HTTP request to send pin to phone number
          const pinResponse = await axios({
            method: 'POST',
            url: '/api/v1/auth/pin',
            data: {
              phone: this.phone
            }
          })

          this.pinSent = true
          if (pinResponse && pinResponse.data && pinResponse.data.rawPin) {
            this.pin = pinResponse.data.rawPin
          }
          this.loading = false
          // Server sent a pin that is associated with that phone number
        } else {
          // HTTP request to verify pin and authenticate
          const response = await axios({
            method: 'POST',
            url: '/api/v1/auth',
            data: {
              ...this.user,
              ...(this.initialPledge ? { pledge_id: this.initialPledge.id } : {}),
              phone: this.phone,
              pin: this.pin
            }
          })

          // Store the user from the response and load session data
          // Records should automatically be added with the axios interceptor
          if (response && response.data) {
            if (response.data.state) {
              this.setInitialState(response.data.state)
            }
          }
          // Initial pledge will automatically refresh since it's returned in the response.data.records
          // Keep loading state until route change finishes
          this.resolve()
        }
      } catch (e) {
        this.loading = false
        throw e
      }
    },
    resolve () {
      if (this.initialPledge && this.initialPledge.id) {
        this.$router.replace({ name: 'Activated', params: { pledgeId: this.initialPledge.id } })
      } else if (this.$route.query.redirect) {
        this.$router.replace({ path: this.$route.query.redirect })
      } else {
        this.$router.replace({ name: 'Dashboard' })
      }
    }
  }
}
</script>
