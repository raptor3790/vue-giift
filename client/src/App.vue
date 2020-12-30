<template>
  <v-app class="app">
    <navigation />

    <top-bar />

    <v-content>
      <router-view />
    </v-content>

    <div
      v-if="appError"
      @click="$store.commit('setAppError', null)"
      class="error-toast pa-3"
    >
      {{ appError }}
    </div>
  </v-app>
</template>

<script>
import TopBar from '@/components/TopBar'
import Navigation from '@/components/Navigation'
import { mapState } from 'vuex'

export default {
  name: 'App',

  components: {
    TopBar,
    Navigation
  },

  data: () => ({
    //
  }),

  computed: {
    ...mapState(['appError'])
  }
}
</script>
