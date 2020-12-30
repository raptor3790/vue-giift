<template>
  <v-container
    px-3
    py-6
    mt-3
  >
    <v-row class="wrapper">
      <v-col>
        <div class="text-center">
          <div>
            <v-img
              align="center"
              width="80%"
              class="mx-auto"
              :src="give"
            />
          </div>
          <div class="t-semi-bold f-xxl my-2">Give</div>
          <p>Show your friends you care with a small pledge for each of their birthdays.</p>
        </div>
      </v-col>
      <v-col>
        <div class="text-center">
          <div>
            <v-img
              align="center"
              width="80%"
              class="mx-auto"
              :src="receive"
            />
          </div>
          <div class="t-semi-bold f-xxl my-2">Receive</div>
          <p>Pool funds from all your friends to make your birthday extra special.</p>
        </div>
      </v-col>
      <v-col>
        <div class="text-center">
          <div>
            <v-img
              align="center"
              width="80%"
              class="mx-auto"
              :src="card"
            />
          </div>
          <div class="t-semi-bold f-xxl my-2">Giift</div>
          <p>A new way to give and receive awesome birthday gifts. Start giving better gifts today.</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      card: require('@/assets/images/card_wide.png'),
      give: require('@/assets/images/give.png'),
      receive: require('@/assets/images/receive.png')
    }
  }
}
</script>
