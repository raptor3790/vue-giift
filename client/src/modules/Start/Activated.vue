<!-- The purpose of this file -->
<template>
  <div>
    <v-container
      v-if="user"
      text-center
      px-10
      pt-6
      pb-3
      class="wrapper"
    >
      <!-- title -->
      <p class="h3 t-bold text-center">Nice 💪</p>
      <p>
        Your fund has been activated and you can redeem it <span class="t-bold">{{ availableDate }}</span>.
      </p>
      <div
        v-if="!hasReciprocated && birthdayIsClose"
        class="mt-6"
      >
        <p class="h3 t-bold text-center">Btw...</p>
        <p>
          {{ ownerizedFirstName }} birthday is {{ fromUserBirthdayDaysAway }} days away.  Would you like to return the favor or pledge to any of your other friends?
        </p>
      </div>
    </v-container>

    <v-container
      px-4
      py-0
    >
      <v-btn
        v-if="!hasReciprocated"
        rounded
        color="primary"
        block
        large
        :to="{ name: 'Dashboard', query: { p: 'give' } }"
      >Give Back To {{ fromUser.first_name }}
      </v-btn>
      <v-btn
        rounded
        color="primary"
        block
        large
        class="mt-2"
        :to="{ name: 'Dashboard', query: { p: 'give' } }"
      >Give to Someone Else
      </v-btn>
      <v-btn
        rounded
        color="primary"
        block
        text
        large
        class="mt-2"
        :to="{ name: 'Dashboard', query: { p: 'receive' } }"
      >View your Fund
      </v-btn>
    </v-container>

    <how-it-works />

    <testimonials />

    <benefits />

    <faqs />

    <a-footer/>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import getNextBirthday from '@/lib/getNextBirthday'

import AFooter from '@/components/Footer'
import Benefits from './components/Benefits'
import Testimonials from './components/Testimonials'
import HowItWorks from './components/HowItWorks'
import Faqs from './components/FAQs'
import { Fund, Pledge } from '@/models'

export default {
  components: {
    AFooter,
    Benefits,
    Testimonials,
    HowItWorks,
    Faqs
  },
  computed: {
    ...mapGetters(['user']),
    fromUser () {
      return (this.pledge && this.pledge.from_user) || { first_name: 'Someone', last_name: 'Awesome' }
    },
    fund () {
      return Fund.query()
        .where('user_id', this.user.id)
        .where('captured_at', null)
        .first()
    },
    availableDate () {
      if (!this.fund) {
        return 'a little before your birthday'
      }
      return 'on ' + moment(this.fund.available_at).utc().format('MMM Do, YYYY')
    },
    ownerizedFirstName () {
      if (this.fromUser.first_name.endsWith('s')) {
        return `${this.fromUser.first_name}'`
      }
      return `${this.fromUser.first_name}'s`
    },
    fromUserBirthdayDaysAway () {
      // If they don't have a birthday then yeah...
      if (!this.fromUser.birthday) {
        return Infinity
      }

      const birthday = getNextBirthday(this.fromUser.birthday)

      return birthday.diff(moment(), 'days')
    },
    birthdayIsClose () {
      return this.fromUserBirthdayDaysAway < 366
    },
    hasReciprocated () {
      // Check to see if I have already given back to this same user
      const myPledge = Pledge.query().where(p =>
        p.to_user_id + '' === this.fromUser.id + '' && p.from_user_id + '' === this.user.id + ''
      ).first()

      return myPledge && (myPledge.amount * 1) > 0
    },
    pledge () {
      return Pledge.query()
        .withAll()
        .where('to_user_id', this.user.id)
        .whereId(this.$route.params.pledgeId)
        .first()
    },
    initialPledgeAmount () {
      return this.pledge && this.pledge.amount
    }
  },
  created () {
    // Require user to be logged in, otherwise redirect them to the start page
    if (!(this.user && this.user.id)) {
      this.$router.replace({ name: 'Start', params: this.$route.params })
    }
    if (!this.fund) {
      Fund.fetchMany()
    }
  }
}
</script>
