<template>
  <v-row no-gutters justify="center">
    <v-col>
      <div class="f-l t-bold">
        <slot name="title" />
      </div>
      <div class="f-xxxs">
        <slot name="sub-title" />
      </div>
    </v-col>
    <v-col
      cols="auto"
      align-self="center"
    >
      <slot name="right" />
    </v-col>
  </v-row>
</template>

<script>
// Simple component that handles layout for the lists used throughout the app.
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    subTitle: {
      type: String,
      default: ''
    }
  }
}
</script>
