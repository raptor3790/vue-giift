<template>
  <div>
    <div
      v-if="loading"
      class="text-center"
      style="position: fixed;top: 70px; left: 0; width: 100%;"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
    <v-simple-table>
      <thead>
        <tr>
          <th>User<br />(user id)</th>
          <th>Available At<br />(fund id)</th>
          <th>Captured<br />(Pledged)</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="fund in funds"
        >
          <tr
            class="green-panel"
            :key="'fund' + fund.id"
          >
            <td>
              {{ fund.user && `${fund.user.first_name} ${fund.user.last_name} ${fund.user.phone}` }}
              <div>#{{ fund.user_id }}</div>
            </td>
            <td>
              {{ fund.available_at }}
              <div>#{{ fund.id }}</div>
            </td>
            <td>
              ${{ fund.amount || '0' }}
              <div>${{ fund.amount_pledged || '0'}}</div>
            </td>
          </tr>
          <tr
            :key="'pledges' + fund.id"
          >
            <td colspan="3" class="pa-0 pb-2">
              <div class="text-center my-2 d-flex justify-center align-center">
                <div
                  v-if="fund.delivered_at"
                >
                  Delivered: <strong>${{ (fund.meta && fund.meta.amount_paid) || '0' }}</strong> {{ fund.delivered_at }}
                  <v-btn
                    text
                    x-small
                    @click="resetStatus(fund)"
                  >Undo</v-btn>
                </div>
                <v-text-field
                  style="max-width: 200px;"
                  v-if="fund.captured_at && !fund.delivered_at"
                  label="GC Amount"
                  type="number"
                  :value="fund.meta && fund.meta.amount_paid"
                  @input="setFundMeta(fund, { amount_paid: $event })"
                />
                <v-btn
                  v-if="!fund.delivered_at"
                  color="secondary"
                  rounded
                  @click="progressStatus(fund)"
                  :disabled="loading"
                >
                  Mark {{ fund.captured_at ? 'Delivered' : 'Captured' }}
                </v-btn>

              </div>
              <div class="pl-6">
                <v-simple-table
                >
                  <tbody>
                    <tr
                      v-for="pledge in fund.pledges"
                      :key="'pledge' + pledge.id"
                    >
                      <td>
                        <strong>${{ pledge.amount || '0' }}</strong> From #{{ pledge.from_user_id }} {{ pledge.from_user && `${pledge.from_user.first_name} ${pledge.from_user.last_name}` }}
                        <div>Pledge #{{pledge.id}}</div>
                        <div
                          v-if="pledge.meta && pledge.meta.charge_error"
                        >
                          Error:
                          <strong
                            class="error--text"
                          >{{ pledge.meta.charge_error }}</strong>
                        </div>
                        <div
                          v-if="pledge.meta && pledge.meta.charge_id"
                        >
                          Charge ID:
                          <strong
                            class="success--text"
                          >{{ pledge.meta.charge_id }}</strong>
                        </div>
                      </td>
                      <td class="text-right">
                        <v-progress-circular
                          v-if="chargingPledge === pledge"
                          indeterminate
                          color="primary"
                        />
                        <v-icon
                          v-else-if="pledge.meta && pledge.meta.charge_id"
                          color="success"
                        >mdi-check</v-icon>
                        <v-icon
                          v-else-if="fund.captured_at"
                        >mdi-skull-crossbones</v-icon>
                        <v-btn
                          v-else
                          color="primary"
                          :disabled="loading"
                          @click="charge(pledge)"
                        >Charge</v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import { Fund, Pledge } from '@/models'
import moment from 'moment'

export default {
  mixins: [Fund.mixin()],
  data () {
    return {
      chargingPledge: null,
      deliveringFund: null
    }
  },
  computed: {
    loading () {
      return this.fundsLoading || !!this.chargingPledge
    },
    funds () {
      return Fund.query()
        .with(['user', 'pledges.from_user'])
        .where(f => moment(f.available_at).isBefore(moment().add(1, 'month')))
        .orderBy('available_at', 'desc')
        .get()
        .map(fund => ({
          ...fund,
          available_at: moment(fund.available_at).format('YYYY-MM-DD'),
          amount_pledged: (fund.pledges || []).reduce((acc, pledge) => (acc * 1) + (pledge.amount || 0) * 1, 0)
        }))
    }
  },
  async created () {
    this.reload()
  },
  methods: {
    async reload () {
      await this.fundsFetchMany({
        params: { admin: 1 }
      })
    },
    async charge (pledge) {
      if (this.chargingPledge) {
        return
      }
      this.chargingPledge = pledge
      try {
        await Pledge.api().request({
          method: 'POST',
          url: `/${Pledge.entity}/${pledge.id}/charge`
        })
        this.chargingPledge = null
      } catch (e) {
        this.chargingPledge = null
        throw e
      }
    },
    async progressStatus (fund) {
      const key = fund.captured_at ? 'delivered_at' : 'captured_at'
      fund = {
        ...fund,
        [key]: moment().toISOString()
      }
      console.log('fund', JSON.stringify(fund))
      const meta = fund.meta || {}
      if (fund.captured_at && !fund.delivered_at && fund.amount > 0) {
        meta.amount_paid = 0.95 * fund.amount
        fund.meta = meta
      }
      console.log('prog', JSON.stringify(fund))
      await this.fundsSave(fund)
    },
    async resetStatus (fund) {
      await this.fundsSave({
        ...fund,
        captured_at: null,
        delivered_at: null,
        meta: {
          amount_paid: (0.95 * (fund.amount || 0))
        }
      })
    },
    setFundMeta (fund, data) {
      let meta = fund.meta || {}
      meta = {
        ...meta,
        ...data
      }
      fund.meta = meta
    }
  }
}
</script>
