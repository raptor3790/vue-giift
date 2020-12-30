<template>
  <v-dialog
    :value="true"
    persistent
    class="no-shadow"
  >
    <v-container class="d-flex flex-column mx-auto fill-width fill-height justify-center align-center wrapper">
      <!-- cancel -->
      <v-row justify="center">
        <v-btn
          text
          color="white"
          class="f-xl t-bold"
          @click="$emit('close')"
          :disabled="loading"
        >Cancel</v-btn>
      </v-row>

      <!-- content -->
      <v-row class="pa-4">
        <div class="dlg-content pa-6 text-center">
          <!-- title -->
          <p class="f-xxl t-bold">Hey There</p>
          <p>Please click confirm below to receive your fund. We'll send you a digital gift card you can use anywhere online to get the gift of your dreams.</p>

          <!-- fund info -->
          <v-row
            no-gutters
            justify="space-between"
            align="center"
            class="mt-4"
          >
            <v-col cols="auto">Total Fund:</v-col>
            <v-col
              cols="auto"
              class="t-bold"
            >${{ totalAmount }}</v-col>
          </v-row>
          <v-row
            no-gutters
            justify="space-between"
            align="center"
            class="mt-2"
          >
            <v-col cols="auto">Processing Fee:</v-col>
            <v-col
              cols="auto"
              class="t-bold"
            >5%</v-col>
          </v-row>
          <v-row
            no-gutters
            justify="space-between"
            align="center"
            class="mt-2"
          >
            <v-col cols="auto">Gift Card Amount:</v-col>
            <v-col
              cols="auto"
              class="t-bold"
            >${{ giftCardAmount }}</v-col>
          </v-row>

          <p class="mt-4 f-s c-grey">
            Please note that the end amount may vary if your friends' pledges do not process successfully.
          </p>

          <!-- get button -->
          <v-btn
            type="button"
            rounded
            color="primary"
            block
            large
            class="mt-3"
            @click="console.log('get card clicked!')"
          >Get Card
          </v-btn>
        </div>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script>

import { mapGetters } from 'vuex'
import { Pledge } from '@/models'

export default {
  computed: {
    ...mapGetters(['user']),
    pledges () {
      if (!this.user) {
        return []
      }
      return Pledge.query().withAll().where(p => p.to_user_id + '' === this.user.id + '').get()
    },
    totalAmount () {
      return this.pledges.reduce((sum, pledge) => {
        return (sum * 1) + ((pledge.amount || 0) * 1)
      }, 0)
    },
    giftCardAmount () {
      return Math.ceil(this.totalAmount * 0.95)
    }
  }
}
</script>
