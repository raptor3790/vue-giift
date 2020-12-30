<template>
  <v-dialog
    :value="true"
    persistent
    overlay-color="black"
    overlay-opacity="0.6"
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
          <form method="post" id="payment-form">
            <div class="f-xxl t-bold mx-4 mx-lg-0 mb-2">Please add a payment form</div>

            <p>Please add a source of payment to confirm your pledge.</p>

            <p class="label form-label">credit card</p>
            <v-stripe-card
              v-if="stripe"
              v-model="source"
              :api-key="stripePublishableKey"
              create="source"
              outlined
              dense
              ref="stripeCard"
              :loading="loading"
            ></v-stripe-card>

            <!-- <p
              v-if="stripePublishableKey.includes('test')"
            >
              Please use <a href="https://stripe.com/docs/testing" target="_blank">test data</a> only.
            </p> -->

            <v-row
              no-gutters
              justify="center"
              align="center"
            >
              <v-col
                cols="auto"
                class="mr-1 f-s t-light"
              >
                Secured by
              </v-col>
              <v-col cols="auto">
                <v-img
                  width="50"
                  height="20"
                  contain
                  :src="stripeIcon"
                />
              </v-col>
            </v-row>

            <v-progress-circular
              v-if="loading"
              color="primary"
              indeterminate
              size="20"
              class="mt-3"
            />

            <div
              v-if="error"
              class="mt-2"
            >{{error}}
            </div>

            <v-btn
              type="button"
              rounded
              color="primary"
              block
              large
              class="mt-3"
              :disabled="!source || loading"
              @click="save"
            >Confirm
            </v-btn>
          </form>
        </div>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { loadStripe } from '@stripe/stripe-js'
import { VStripeCard } from 'v-stripe-elements/lib'
import { User } from '@/models'

const stripePublishableKey = window.stripePublishableKey || 'pk_test_7YkmOXZLFG231kyM9EqXVXFr00xhO8IyYl'

export default {
  components: {
    VStripeCard
  },
  computed: {
    ...mapGetters(['user'])
  },
  data () {
    return {
      stripePublishableKey,
      loading: true,
      error: null,
      stripe: null,
      source: null,
      stripeIcon: require('@/assets/images/ic_stripe.svg')
    }
  },
  async mounted () {
    this.loading = true
    try {
      this.stripe = await loadStripe(stripePublishableKey)
      this.loading = false
      // const elements = stripe.elements()
      // const style = {}
      // const card = elements.create('card', { style: style })
      // card.mount(this.$refs.cardElement)
      await this.$nextTick()

      this.$watch(
        () => this.$refs.stripeCard.okToSubmit,
        async (value) => {
          this.$set(this, 'loading', true)
          try {
            await this.$refs.stripeCard.processCard()
            this.loading = false
          } catch (e) {
            this.loading = false
            throw e
          }
        }
      )
    } catch (e) {
      this.loading = false
      this.e = 'Error loading payment gateway: ' + e.message
    }
  },
  methods: {
    async save () {
      if (!this.source && this.source.id) {
        return
      }
      this.loading = true
      try {
        await User.save({
          ...this.user,
          stripe_source_id: this.source.id
        })
        this.loading = false
        this.$emit('success')
      } catch (e) {
        this.loading = false
        throw e
      }
    }
  }
}
</script>
