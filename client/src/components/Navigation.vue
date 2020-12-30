<template>
  <v-navigation-drawer
    fixed
    temporary
    :value="nav"
    width="100%"
    color="white"
    hide-overlay
    flat
    @input="setNav"
    style="margin-top: 56px;"
  >
    <v-list
      dense
      nav
    >
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.path"
        link
        @click="setNav(false)"
      >
        <v-list-item-content>
          <v-list-item-title class="h3 px-6 py-2">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-if="user && user.meta && user.meta.admin"
        link
        :to="{ name: 'Admin' }"
      >
        <v-list-item-content>
          <v-list-item-title class="h3 px-6 py-2">
            Admin
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-if="user && user.id"
        link
        @click="startLogout"
      >
        <v-list-item-content>
          <v-list-item-title class="h3 px-6 py-2">
            Logout
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <a-footer/>
    </template>
  </v-navigation-drawer>
</template>

<style lang="scss">
.v-navigation-drawer {
  height: calc(100% - 56px) !important;
  box-shadow: none !important;
}
</style>

<script>
import AFooter from '@/components/Footer'

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  components: {
    AFooter
  },
  computed: {
    ...mapState(['nav', 'initialPledgeId']),
    ...mapGetters(['user']),
    items () {
      return [
        ...(this.initialPledgeId && !(this.user && this.user.id) ? [{ title: 'Accept Pledge', path: `/start/${this.initialPledgeId}` }] : []),
        ...(this.initialPledgeId || (this.user && this.user.id) ? [] : [{ title: 'Home', path: '/' }]),
        ...(this.user && this.user.id ? [{ title: 'Dashboard', path: '/dashboard' }] : []),
        { title: 'FAQs', path: '/faq' },
        // { title: 'About', path: '/about' },
        { title: 'Settings', path: '/settings' },
        { title: 'Terms', path: '/terms' },
        { title: 'Privacy', path: '/privacy' }
      ]
    }
  },
  methods: {
    ...mapMutations(['setNav']),
    ...mapActions(['logout']),
    async startLogout () {
      await this.logout()
      this.setNav(false)
    }
  }
}
</script>
