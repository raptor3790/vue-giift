<!-- The purpose of this file -->
<template>
  <div class="d-flex flex-column fill-height">
    <v-container
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
      text-center
      px-6
      pt-0
      class="wrapper"
    >
      <div class="mt-6 t-bold h3">Give A Gift They’ll Love</div>
      <div class="mt-2 mx-4 t-light">
        Giift is a new way to give and receive awesome birthday gifts. Start giving better gifts today.
      </div>
    </v-container>

    <v-container
      text-center
      px-10
      class="wrapper d-flex flex-grow-1 align-center justify-center"
    >
      <div>
        <div class="t-semi-bold primary--text">Private Beta</div>
        <div
          class="t-light f-s mt-2"
          style="line-height: 20px; color: #4F5757;"
        >
          Giift is currently in private beta. You must receive a giift from someone to start giving.
        </div>
      </div>
    </v-container>

    <a-footer privacy />
  </div>
</template>

<script>
import AFooter from '@/components/Footer'

export default {
  components: {
    AFooter
  },
  data () {
    return {
      offerToTest: false,
      giftIcon: require('@/assets/images/card_wide.png')
    }
  },
  mounted () {
    setTimeout(() => {
      this.offerToTest = false
    }, 2000)
  }
}
</script>
