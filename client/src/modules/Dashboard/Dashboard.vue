<template>
  <div>
    <v-tabs
      :value="tab"
      centered
      grow
      color="#FDE74C"
      background-color="white"
      height="44"
      @change="setRoute"
    >
      <v-tab>Give</v-tab>
      <v-tab>Receive</v-tab>
    </v-tabs>
    <div class="mt-2">
      <give v-if="tab === 0" />
      <receive v-else-if="tab === 1" />
    </div>
  </div>
</template>

<script>
import Give from './Give'
import Receive from './Receive'

export default {
  components: {
    Give,
    Receive
  },
  computed: {
    tab () {
      if (this.$route && this.$route.query && this.$route.query.p === 'receive') {
        return 1
      }
      return 0
    }
  },
  methods: {
    setRoute (r) {
      console.log('set route', r)
      this.$router.push({ query: { p: r === 1 ? 'receive' : 'give' } })
    }
  }
}
</script>
