<template>
  <div class="pb-3">
    <!-- title -->
    <v-container text-center>
      <div class="f-xxl t-bold">
        {{ titles[step - 1] }}
      </div>
      <div class="ma-2">
        {{ subTitles[step - 1] }}
      </div>
    </v-container>

    <!-- step -->
    <v-row
      justify="space-around"
      no-gutters
      class="wrapper mb-3"
    >
      <v-col
        cols="auto"
        class="step-item"
        :class="step >= 1 ? 'active' : ''"
      >
        <v-row
          align="center"
          justify="center"
          no-gutters
          class="circle f-xl "
        >1
        </v-row>
        <v-row class="f-xs">
          Add friends
        </v-row>
      </v-col>
      <v-col
        cols="auto"
        class="step-item"
        :class="step >= 2 ? 'active' : ''"
      >
        <v-row
          align="center"
          justify="center"
          no-gutters
          class="circle f-xl"
        >2
        </v-row>
        <v-row class="f-xs">
          Make Pledge
        </v-row>
      </v-col>
      <v-col
        cols="auto"
        class="step-item"
        :class="step >= 3 ? 'active' : ''"
      >
        <v-row
          align="center"
          justify="center"
          no-gutters
          class="circle f-xl"
        >3
        </v-row>
        <v-row class="f-xs">
          Send Invites
        </v-row>
      </v-col>
    </v-row>

    <!-- pledge list -->
    <v-container
      pt-2
      pb-1
      class="wrapper"
      :class="step == 1 ? 'px-10' : 'px-6'"
    >
      <div
        v-for="(pledge, $pledgeIndex) in pledges"
        :key="'pledge' + $pledgeIndex"
      >
        <p
          v-if="step === 1"
          class="label form-label"
        >
          Friend {{ $pledgeIndex + 1 }}
        </p>
        <v-text-field
          v-if="step === 1"
          :label="'Friend' + ($pledgeIndex + 1)"
          placeholder="i.e. Eugene Levy"
          outlined
          solo
          flat
          dense
          hide-details
          color="#E9E9E9"
          background-color="white"
          v-model="pledge.name"
        />
        <pledge-row
          v-else
          :edit="!!(pledge && pledge.id)"
          :value="pledge"
          @input="$set(pledge, 'amount', $event)"
          ref="pledgeRows"
        >
          <div
            v-if="step === 3"
            slot="right"
          >
            <v-btn
              text
              color="primary"
              class="img-top-btn"
              :href="generateSmsLink(pledge)"
              @click="markAsSent(pledge)"
            >
              <v-row
                no-gutters
                align="center"
                justify="center"
                class="flex-column"
              >
                <v-col cols="auto">
                  <v-img
                    align="center"
                    eager
                    :src="pledge.meta && pledge.meta.user_sent ? msgIcon : smsIcon"
                  />
                </v-col>
                <v-col class="f-xxxs t-regular mt-2">
                  {{ pledge.meta && pledge.meta.user_sent ? 'MSG Sent' : 'Send SMS' }}
                </v-col>
              </v-row>
            </v-btn>
          </div>
        </pledge-row>
      </div>
    </v-container>

    <!-- add button -->
    <div
      v-if="step === 1 && pledges.length < 6"
      class="text-center"
    >
      <v-btn
        text
        color="primary"
        @click="addFriend"
      >+ Add More Friends</v-btn>
    </div>

    <!-- note -->
    <div
      v-if="step > 1"
      class="green-panel mt-6"
    >
      <v-container class="wrapper">
        <v-row no-gutters>
          <v-col cols="auto">
            <v-img
              align="center"
              width="40"
              height="40"
              eager
              :src="fistIcon"
            />
          </v-col>
          <v-col class="ml-2 f-s t-light">
            This is just a pledge.  You won't be charged until your friends' birthday.  You can change the amount at any time before their birthday.
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container
      text-center
      class="bottom-fixed wrapper pb-1"
    >
      <v-btn
        rounded
        color="primary"
        block
        large
        @click="next"
        :disabled="!valid || pledgesLoading"
      >
        {{ cta }}
      </v-btn>
      <v-btn
        text
        color="primary"
        class="mx-auto mt-1"
        @click="back"
        :disabled="pledgesLoading"
      >Back
      </v-btn>
    </v-container>

    <!-- footer -->
    <a-footer padding="2" />

    <payment-source-dialog
      v-if="paymentSourceDialog"
      @close="paymentSourceDialog = false"
      @success="next"
    />
  </div>
</template>

<style lang="scss" scoped>
.step-item {
  font-family: 'SofiaProRegular';

  &.active {
    font-family: 'SofiaProBold';

    .circle {
      background-color: #FDE74C;
    }
  }

  .circle {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-bottom: 0.5rem;
    background-color: #FEF7C9;
  }
}
</style>

<script>
import AFooter from '@/components/Footer'
import PledgeRow from './PledgeRow'
import { Pledge } from '@/models'
import { mapState, mapGetters, mapMutations } from 'vuex'
import ChangesMixin from '@/lib/ChangesMixin'
import PaymentSourceDialog from '@/modules/Account/PaymentSourceDialog'
import get from 'lodash/get'
import generateSmsLink from '@/lib/generateSmsLink'
import moment from 'moment'

export default {
  mixins: [
    Pledge.mixin(),
    ChangesMixin({ recordKeys: 'pledges' })
  ],
  components: {
    AFooter,
    PledgeRow,
    PaymentSourceDialog
  },
  data () {
    return {
      paymentSourceDialog: false,
      pledges: [],
      fistIcon: require('@/assets/images/ic_fist.svg'),
      smsIcon: require('@/assets/images/ic_sms.svg'),
      msgIcon: require('@/assets/images/ic_msg.svg'),
      titles: [
        'Start Funds 🥳',
        'Make A Pledge 🥳',
        "Let's Notify Your Friends 🥳"
      ],
      subTitles: [
        'We\'ll create a unique link your friend can use to activate their birthday fund.',
        'Choose how much you\'d like to pledge to each friends\' birthday fund',
        'Click Send SMS and send each friend their activation link.  NOTICE: You must send the activation link and they must click it to accept.'
      ]
    }
  },
  computed: {
    ...mapState(['newPledges']),
    ...mapGetters(['user']),
    step () {
      return ((this.$route && this.$route.query && this.$route.query.step) || 1) * 1
    },
    cta () {
      if (this.step === 1) {
        return 'Add Friends'
      } else if (this.step === 2) {
        return 'Confirm Pledges'
      }
      return 'Complete'
    },
    pledgesWithNames () {
      return this.pledges.filter(pledge => !!((pledge.name || '').trim()))
    },
    pledgesMissingAmounts () {
      return (this.pledges || []).filter(pledge => !(pledge.amount * 1))
    },
    valid () {
      if (this.step === 1) {
        if (!this.pledgesWithNames.length) {
          return false
        }
      } else if (this.step === 2) {
        if (this.pledgesMissingAmounts.length > 0) {
          return false
        }
      } else if (this.step === 3) {
        const pledgesSent = this.pledges.filter(pledge => pledge.meta && pledge.meta.user_sent)
        return pledgesSent.length >= this.pledges.length
      }
      return true
    }
  },
  watch: {
    pledges () {
      this.setNewPledges(this.pledges)
    }
  },
  methods: {
    ...mapMutations(['setNewPledges']),
    addFriend () {
      this.pledges.push({ from_user_id: this.user.id, name: '', amount: '', meta: { user_sent: false } })
    },
    async back () {
      if (this.step > 1) {
        this.$router.go(-1)
        return
      }
      this.$emit('cancel')
    },
    async next () {
      if (this.step === 1) {
        // Remove empty names
        this.pledges = this.pledgesWithNames
        this.$router.push({ query: { ...this.$route.query || {}, step: 2 } })
      } else if (this.step === 2) {
        // Ensure a valid payment source
        if (!get(this.user, 'payment_source.valid')) {
          this.paymentSourceDialog = true
          return
        }
        this.paymentSourceDialog = false

        // Call to server to create/update all pledges
        // This should actually be done within the PledgeRow component
        let error = null

        this.pledges = await Promise.all(this.pledges
          .filter(p => !p.deleted)
          .map(async (pledge, index) => {
            try {
              const response = await this.pledgesSave(pledge)
              return response.entities.pledges[0]
            } catch (e) {
              error = e
            }
            return this.pledges[index]
          })
        )

        // Ensure they have a payment method
        if (error) {
          throw error
        } else {
          this.$router.push({ query: { ...this.$route.query || {}, step: 3 } })
        }
      } else if (this.step === 3) {
        this.pledges = []
        await this.$nextTick()
        this.$emit('finish')
      }
    },
    generateSmsLink (pledge) {
      return generateSmsLink(pledge)
    },
    markAsSent (pledge) {
      setTimeout(() => {
        // Force set this...
        this.$set(pledge, 'meta', {
          ...(pledge.meta || {}),
          user_sent: true,
          sent_at: moment().utc().toISOString()
        })
        try {
          this.pledgesSave(pledge)
        } catch (e) {
          // Not the end of the world if we miss out on this
        }
      }, 1000)
    }
  },
  created () {
    // If the page gets refreshed on a step > 1, cancel adding and go
    // back.
    // If the user is on step 2 then they lose the names of those pledges
    // For a small number of cases this sucks for right now
    // If the user is on step 3 their pledges are saved and will show up on the give page
    if (
      this.step > 1 &&
      !(this.newPledges && this.newPledges.length) &&
      !(this.pledges && this.pledges.length)
    ) {
      this.$emit('cancel')
      return
    }

    if (this.newPledges && this.newPledges.length) {
      this.pledges = this.newPledges
    }

    // Remove all pledges that have an id since they are persisted and
    // already exist on the server.  Use the main dashboard UI to modify these.
    this.pledges = this.pledges.filter(p => !(p && p.id))

    if (!(this.pledges && this.pledges.length)) {
      for (var i = 0; i < 3; i++) {
        this.addFriend()
      }
    }
    // If all pledges have names skip to step 2
    if (this.pledgesWithNames.length === this.pledges.length) {
      this.$router.push({ query: { ...this.$route.query || {}, step: 2 } })
    }
  }
}
</script>
