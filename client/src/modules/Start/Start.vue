<template>
  <div>
    <v-container
      v-if="user"
      px-10
      pt-6
      pb-0
      class="wrapper"
    >
      <v-img
        align="center"
        width="100%"
        :src="giftIcon"
      />
    </v-container>
    <v-container
      v-if="user"
      px-10
      pt-0
      class="wrapper"
    >
      <!-- title -->
      <p class="h3 t-bold text-center">
        Hey {{ user.first_name }} 👋
      </p>
      <p class="text-center">
        {{ fromUser.first_name }} {{ fromUser.last_name }} has chipped in
        <span v-if="initialPledgeAmount" class="t-bold">${{ initialPledgeAmount }}</span>
        to your birthday fund on Giift. Please confirm your birthday to activate
        your fund.
      </p>

      <!-- first name -->
      <p class="label form-label">first name</p>
      <v-text-field
        label="first name"
        placeholder="i.e. Eugene"
        outlined
        solo
        flat
        dense
        hide-details
        color="#E9E9E9"
        background-color="white"
        :value="user.first_name"
        @input="setNewUser({ first_name: $event })"
      />

      <!-- last name -->
      <p class="label form-label">last name</p>
      <v-text-field
        label="last name"
        placeholder="i.e. Levy"
        outlined
        solo
        flat
        dense
        hide-details
        color="#E9E9E9"
        background-color="white"
        :value="user.last_name"
        @input="setNewUser({ last_name: $event })"
      />

      <!-- birthday -->
      <p class="label form-label">birthday</p>
      <birthday-picker
        label="birthday"
        placeholder="i.e. Dec 17, 1990"
        outlined
        :value="user.birthday"
        @input="setNewUser({ birthday: $event })"
      />

      <!-- phone number -->
      <p class="label form-label">phone number</p>
      <v-text-field
        label="phone number"
        type="tel"
        placeholder="i.e. 555-555-5555"
        outlined
        solo
        flat
        dense
        hide-details
        color="#E9E9E9"
        background-color="white"
        :value="user.phone"
        :error="user.phone && !validPhone"
        @input="setNewUser({ phone: $event })"
      />

      <!-- message -->
      <p class="text-center mt-3 mb-0 f-xxs c-grey">
        Your phone number will only be used to create your account and get gift
        notifications from friends. Already have an account?
      </p>
      <div class="text-center">
        <v-btn
          text
          color="primary"
          :to="{ name: 'Login' }"
        >Login here
        </v-btn>
      </div>
    </v-container>

    <deals />

    <benefits />

    <testimonials />

    <how-it-works />

    <faqs />

    <v-container
      text-center
      class="bottom-fixed wrapper"
    >
      <v-btn
        color="primary"
        rounded
        block
        large
        :to="{ name: 'Login' }"
        :disabled="!valid"
      >Activate Fund
      </v-btn>
    </v-container>

    <a-footer padding="1" />

  </div>
</template>

<script>
import AFooter from '@/components/Footer'
import Benefits from './components/Benefits'
import Testimonials from './components/Testimonials'
import HowItWorks from './components/HowItWorks'
import Faqs from './components/FAQs'
import Deals from './components/Deals'
import { Pledge } from '@/models'
import BirthdayPicker from '@/components/BirthdayPicker'

import { mapGetters, mapMutations } from 'vuex'
import get from 'lodash/get'

export default {
  components: {
    AFooter,
    BirthdayPicker,
    Benefits,
    Testimonials,
    HowItWorks,
    Faqs,
    Deals
  },
  data () {
    return {
      giftIcon: require('@/assets/images/card_wide.png')
    }
  },
  async created () {
    if (!this.initialPledge && this.$route.params.pledgeId) {
      // Attempt to pull the pledge if it's missing.  This will generally only be done
      // when the server can't bootstrap the pledge model when running in dev mode
      try {
        await Pledge.fetchOne(this.$route.params.pledgeId)
        this.setInitialPledgeId(this.$route.params.pledgeId)
      } catch (e) {
        console.log('error loading initial pledge', e)
        // Redirect to home
        this.$router.replace({ path: '/' })
      }
    }

    // Prefill the user's first name with what is in the initial pledge
    if (get(this.initialPledge, 'name')) {
      const nameParts = (get(this.initialPledge, 'name') || '').split(' ')
      // Remove last name
      if (nameParts.length > 1) {
        this.setNewUser({ last_name: nameParts.pop() })
      }
      this.setNewUser({ first_name: nameParts.join(' ') })
    }

    // Make sure there's a new user object
    if (!this.user) {
      this.setNewUser({ first_name: '' })
    }
  },
  computed: {
    ...mapGetters(['initialPledge', 'user']),
    fromUser () {
      return (this.initialPledge && this.initialPledge.from_user) || { first_name: 'Someone', last_name: 'Awesome' }
    },
    initialPledgeAmount () {
      return this.initialPledge && this.initialPledge.amount
    },
    validPhone () {
      const phone = ((this.user && this.user.phone) || '').replace(/\D/g, '')
      if (phone.startsWith('1')) {
        return phone.length === 11
      } else {
        return phone.length === 10
      }
    },
    valid () {
      return this.user && this.validPhone && this.user.first_name && this.user.last_name && this.user.birthday
    }
  },
  methods: {
    ...mapMutations(['setNewUser', 'setInitialPledgeId'])
  }
}
</script>
