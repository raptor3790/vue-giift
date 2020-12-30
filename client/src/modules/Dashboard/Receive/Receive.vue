<template>
  <div>
    <!-- fund -->
    <v-container
      v-if="birthdayIsToday"
      text-center
      pb-0
      class="wrapper"
    >
      <p class="f-xxl t-bold">Your Fund Is Ready! 🥳</p>
      <p class="mx-8 mx-lg-2">Click redeem below to claim your fund</p>
      <div class="h2 t-bold primary--text">Total: ${{ totalAmount }}</div>
    </v-container>

    <!-- not ready -->
    <v-container
      v-else
      text-center
      pb-0
      class="wrapper"
    >
      <p
        v-if="birthdayDaysAway !== null"
        class="f-xxl t-bold"
        style="margin: 0px;"
      >
        Only {{ birthdayDaysAway }} Day{{ birthdayDaysAway > 1 ? 's' : '' }} Left 🥳
      </p>
      <p
        v-else
      >
        Please add a birthday
      </p>
      <div class="wrapper px-6">
        <v-img
          align="center"
          width="100%"
          :src="giftIcon"
        />
      </div>
      <div class="h2 t-bold primary--text" style="margin-top: 10px">Fund Amount: ${{ totalAmount }}</div>
      <div class="px-5">
        <fund-progress
          :percent="percent"
          :value="totalAmount"
          :goal="nextIncrement"
        />
      </div>
    </v-container>

    <!-- label -->
    <div class="wrapper px-6 pt-3 label">
      Your Pledgers
    </div>

    <!-- pledge list -->
    <list-row
      class="wrapper px-6 pt-2 pb-1"
      v-for="pledge in pledges"
      :key="pledge.id"
    >
      <!-- name -->
      <span slot="title">
        {{ (pledge.from_user && `${pledge.from_user.first_name || ''} ${pledge.from_user.last_name || ''}`) || pledge.from_user_id }}
      </span>
      <!-- created at -->
      <span
        v-if="pledge.created_at"
        slot="sub-title"
      >
        {{ moment(pledge.created_at).utc().format('MMM Do') }}
      </span>
      <!-- amount -->
      <span
        slot="right"
        class="primary--text t-bold"
      >
        ${{ pledge.amount }}
      </span>
    </list-row>

    <v-container
      text-center
      class="bottom-fixed wrapper"
      :class="birthdayDaysAway ? 'pb-3' : 'pb-2'"
    >
      <v-btn
        rounded
        color="primary"
        block
        large
        @click="redeeming = true"
        :disabled="!birthdayIsToday"
      >Redeem Fund
      </v-btn>
      <div
        v-if="!birthdayIsToday"
        class="f-xxs c-grey mt-2"
      >
        Your fund will be available in {{ birthdayDaysAway }} day{{ birthdayDaysAway == 1 ? '' : 's' }}.  <router-link :to="{ name: 'Faq' }">Learn More</router-link>
      </div>
    </v-container>

    <a-footer :padding="birthdayDaysAway ? '1' : '3'" />

    <redeem
      v-if="redeeming"
      @close="redeeming = false"
    />
  </div>
</template>

<script>
import AFooter from '@/components/Footer'
import FundProgress from '@/components/FundProgress'
import ListRow from '@/components/ListRow'
import Redeem from './Redeem'
import getNextBirthday from '@/lib/getNextBirthday'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Fund, Pledge } from '@/models'
import max from 'lodash/max'

const increments = [100, 200, 250, 500, 1000, 2000, 10000000]
const daysBeforeBirthdayToRedeem = 0

export default {
  mixins: [
    Fund.mixin(),
    Pledge.mixin()
  ],
  components: {
    AFooter,
    FundProgress,
    ListRow,
    Redeem
  },
  data () {
    return {
      redeeming: false,
      giftIcon: require('@/assets/images/card_wide.png')
    }
  },
  computed: {
    ...mapGetters(['user']),
    fund () {
      return Fund.query()
        .where('user_id', this.user.id)
        .where('captured_at', null)
        .first()
    },
    birthdayDaysAway () {
      // If they don't have a birthday then yeah...
      if (!(this.user && this.user.birthday)) {
        return null
      }

      let birthday = getNextBirthday(this.user.birthday)

      // Instantiate the birthday in local timezone for comparison
      birthday = moment().year(birthday.year()).month(birthday.month()).date(birthday.date())

      const days = birthday.diff(moment(), 'days')

      // + 1 because it automatically floors (23 hours 59 minutes is considered 0 days)
      if (days === 0 && moment().isBefore(birthday)) {
        return 1
      }
      return days
    },
    redeemDaysAway () {
      if (!(this.fund && this.fund.available_at)) {
        return null
      }
      return moment(this.fund.available_at).subtract(daysBeforeBirthdayToRedeem, 'days').diff(moment(), 'days')
    },
    pledges () {
      if (!this.user) {
        return []
      }
      return Pledge.query()
        .withAll()
        .where(p =>
          p.to_user_id + '' === this.user.id + '' &&
          p.amount * 1 > 0 &&
          (!(this.fund && this.fund.id) || this.fund.id + '' === p.fund_id + '')
        )
        .get()
    },
    totalAmount () {
      return this.pledges.reduce((sum, pledge) => {
        return (sum * 1) + ((pledge.amount || 0) * 1)
      }, 0)
    },
    nextIncrement () {
      return increments.filter(i => i > this.totalAmount)[0]
    },
    percent () {
      // Because it just looks better when it is at least 15%
      return max([100 * this.totalAmount / this.nextIncrement, 15])
    },
    birthdayIsToday () {
      return this.user && this.user.birthday && moment(this.user.birthday).utc().format('MM-DD') === moment().format('MM-DD')
    }
  },
  async created () {
    if (!this.fund) {
      await this.fundsFetchMany()
    }
  }
}
</script>
