<template>
  <div>
    <v-footer
      color="white"
      style="opacity: 0;"
      class="pt-10"
      :class="paddingClass"
    >
      <v-row
        no-gutters
        class="text-center c-grey flex-column fill-width"
      >
        <v-col class="f-s t-regular">hello@giift.app</v-col>
        <v-col
          v-if="this.privacy"
          class="f-xs my-1"
        >
          <router-link :to="{ name: 'Privacy' }">privacy policy</router-link>
          <span class="px-1">•</span>
          <router-link :to="{ name: 'Terms' }">terms of service</router-link>
        </v-col>
        <v-col class="f-xxs">Copyright 2020 Giift Inc</v-col>
      </v-row>
    </v-footer>

    <v-footer
      absolute
      color="white"
      style="bottom: 0px;"
      :class="paddingClass"
    >
      <slot name="default">
        <v-row
          no-gutters
          class="text-center c-grey flex-column fill-width"
        >
          <v-col class="f-s t-regular">hello@giift.app</v-col>
          <v-col
            v-if="this.privacy"
            class="f-xs my-1"
          >
            <router-link :to="{ name: 'Privacy' }">privacy policy</router-link>
            <span class="px-1">•</span>
            <router-link :to="{ name: 'Terms' }">terms of service</router-link>
          </v-col>
          <v-col class="f-xxs">Copyright 2020 Giift Inc</v-col>
        </v-row>
      </slot>
    </v-footer>
  </div>
</template>

<style lang="scss" scoped>
.padding-1 {
  padding-bottom: 70px;
}
.padding-2 {
  padding-bottom: 102px;
}
.padding-3 {
  padding-bottom: 90px;
}
a {
  text-decoration: none;
}
</style>

<script>
export default {
  props: {
    padding: String,
    privacy: Boolean
  },
  computed: {
    paddingClass () {
      if (this.padding) {
        return 'padding-' + this.padding
      }
      return ''
    }
  }
}
</script>
