<template>
  <v-app-bar
    app
    flat
    color="white"
  >
    <v-col class="pa-0">
      <v-app-bar-nav-icon
        color="black"
        class="pa-3"
        @click="setNav(!nav)"
      >
        <v-img
          :src="nav ? close : menu"
        >
        </v-img>
      </v-app-bar-nav-icon>
    </v-col>

    <v-toolbar-title>
      <v-img
        align="center"
        width="46"
        height="18"
        eager
        :src="logo"
      />
    </v-toolbar-title>

    <v-col class="pa-0 text-right">
      <v-btn
        v-if="user && user.id && !($route && $route.path === '/dashboard')"
        text
        color="primary"
        class="px-0 f-m"
        :to="{ name: 'Dashboard' }"
      >Dashboard
      </v-btn>
      <v-btn
        v-else-if="!(user && user.id) && !login && !($route && $route.path === '/login')"
        text
        color="primary"
        class="px-0 f-m"
        :to="{ name: 'Login' }"
      >Login
      </v-btn>
    </v-col>
  </v-app-bar>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      logo: require('@/assets/images/logo.svg'),
      menu: require('@/assets/images/ic_menu.svg'),
      close: require('@/assets/images/ic_close.svg')
    }
  },
  computed: {
    ...mapState(['nav', 'login']),
    ...mapGetters(['user'])
  },
  methods: {
    ...mapMutations(['setNav'])
  }
}
</script>
