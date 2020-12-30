<template>
  <div>
    <v-container
      text-center
      class="wrapper"
    >
      Invite more people to your fund by pledging to give to theirs.
    </v-container>

    <!-- Reciprocate -->
    <v-container class="wrapper">
      <v-row
        align="center"
        justify="space-between"
        class="mb-3"
      >
        <v-col class="label">Your Pledges</v-col>
        <v-col cols="auto">
          <v-btn
            v-if="!reciprocationPledge"
            small
            text
            color="primary"
            @click="edit = !edit,clearChanges()"
          >{{ edit ? 'cancel' : 'edit' }}
          </v-btn>
        </v-col>
      </v-row>
      <div
        v-for="(pledge, $index) in pledges"
        :key="$index"
      >
        <pledge-row
          v-if="!(pledgesChanged[$index] && pledgesChanged[$index].deleted)"
          :value="pledgesChanged[$index]"
          :edit="edit"
          ref="pledgeRows"
          @change="handleChange('pledges', `${$index}.${$event.path}`, $event.value)"
          @delete="handleChange('pledges', `${$index}.deleted`, true)"
        >
          <v-btn
            v-if="!edit && !pledge.to_user_id"
            slot="right"
            text
            color="primary"
            class="img-top-btn v-btn--compact"
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
                  :src="pledge.meta && pledge.meta.user_sent ? smsIcon : msgIcon"
                />
              </v-col>
              <v-col class="f-xxxs t-regular mt-2">{{ pledge.meta && pledge.meta.user_sent ? 'Remind' : 'Invite' }}</v-col>
            </v-row>
          </v-btn>
        </pledge-row>
      </div>
      <div
        class="wrapper mt-3"
        v-if="!reciprocationPledge && !edit"
      >
        <v-btn
          class="px-0"
          text
          color="primary"
          small
          @click="$emit('add-friends')"
        >+ Add {{ pledges.length > 0 ? 'More ' : '' }}Friends
        </v-btn>
      </div>
    </v-container>

    <!-- note -->
    <div class="green-panel mt-6">
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
      class="bottom-fixed wrapper"
    >
      <v-btn
        v-if="edit || reciprocationPledge || allChanges.length"
        rounded
        color="primary"
        block
        large
        @click="saveAll"
        :disabled="pledgesLoading || !allChanges.length"
      >Confirm
      </v-btn>
      <v-btn
        v-else
        rounded
        color="primary"
        block
        large
        @click="$emit('add-friends')"
        :disabled="pledgesLoading"
      >Make New Pledge
      </v-btn>
    </v-container>

    <!-- footer -->
    <a-footer padding="1" />

    <payment-source-dialog
      v-if="paymentSourceDialog"
      @close="paymentSourceDialog = false"
      @success="saveAll"
    />
  </div>
</template>

<script>
import AFooter from '@/components/Footer'
import PledgeRow from './PledgeRow'
import ChangesMixin from '@/lib/ChangesMixin'
import { Pledge } from '@/models'
import { mapGetters } from 'vuex'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import moment from 'moment'
import PaymentSourceDialog from '@/modules/Account/PaymentSourceDialog'
import generateSmsLink from '@/lib/generateSmsLink'

export default {
  mixins: [
    Pledge.mixin(),
    ChangesMixin({ recordKeys: ['pledges'] })
  ],
  components: {
    AFooter,
    PledgeRow,
    PaymentSourceDialog
  },
  data () {
    return {
      paymentSourceDialog: false,
      edit: false,
      fistIcon: require('@/assets/images/ic_fist.svg'),
      smsIcon: require('@/assets/images/ic_sms.svg'),
      msgIcon: require('@/assets/images/ic_msg.svg')
    }
  },
  computed: {
    ...mapGetters(['user']),
    pledges () {
      if (this.reciprocationPledge) {
        return [this.reciprocationPledge]
      }
      const pledges = Pledge.query()
        .withAll()
        .where(p => p.from_user_id + '' === this.user.id + '')
        .orderBy('created_at')
        .get()
        .map(pledge => ({
          ...pledge,
          amount: pledge.amount ? pledge.amount * 1 : null
        }))

      const reciprocationPledges = Pledge.query()
        .withAll()
        .where(p => p.to_user_id + '' === this.user.id + '')
        .orderBy('created_at')
        .get()
        .filter(pledgeToMe => {
          return !pledges.find(pledgeFromMe =>
            pledgeFromMe.from_user_id + '' === this.user.id + '' &&
            pledgeFromMe.to_user_id + '' === pledgeToMe.from_user_id + ''
          )
        })
        .map(pledgeToMe => {
          return {
            from_user: this.user,
            from_user_id: this.user.id,
            to_user: pledgeToMe.from_user,
            to_user_id: pledgeToMe.from_user_id,
            meta: {
              reciprocation: true
            }
          }
        })

      return pledges.concat(reciprocationPledges)
    },
    reciprocationPledge () {
      if (!this.$route.query.reciprocate) {
        return
      }

      const pledge = Pledge.query().withAll().whereId(this.$route.query.reciprocate + '').first()

      if (!pledge) {
        return null
      }

      const iAlreadyPledgedThisPerson = Pledge.query().withAll().where(p => p.from_user_id + '' === this.user.id + '' && p.to_user_id + '' === pledge.from_user_id + '').first()
      if (iAlreadyPledgedThisPerson) {
        return iAlreadyPledgedThisPerson
      }

      return {
        from_user_id: this.user.id,
        to_user_id: pledge.from_user_id,
        to_user: pledge.from_user,
        meta: {
          reciprocation: true
        }
      }
    }
  },
  methods: {
    generateSmsLink (pledge) {
      if (!pledge.name && pledge.first_name) {
        pledge = {
          ...pledge,
          name: pledge.first_name
        }
      }
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
    },
    async saveAll () {
      if (!get(this.user, 'payment_source.valid')) {
        this.paymentSourceDialog = true
        return
      }
      this.paymentSourceDialog = false

      const indexesWithChanges = uniq(this.pledgesChanges.map(change => {
        return change.path.split('.')[0] * 1
      }))

      const promises = []
      let error = null
      // Save all to server, remove changes after each success
      for (var i = 0; i < indexesWithChanges.length; i++) {
        const pledgeIndex = indexesWithChanges[i]
        promises.push((async () => {
          try {
            if (this.pledgesChanged[pledgeIndex].deleted) {
              await this.pledgesDestroy(this.pledgesChanged[pledgeIndex])
            } else {
              await this.pledgesSave(this.pledgesChanged[pledgeIndex])
            }
            this.clearChanges((r) => !r.path.startsWith(`${pledgeIndex}.`))
          } catch (e) {
            error = e
          }
        })())
      }

      await Promise.all(promises)

      if (error) {
        throw error
      }
      this.edit = false
      this.$router.push({
        query: {
          ...(this.$route.query || {}),
          reciprocate: undefined
        }
      })
    }
  },
  created () {
    console.log('my pledges', this)
  }
}
</script>
