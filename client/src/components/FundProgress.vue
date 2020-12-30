<template>
  <v-container
    fluid
    mt-3
    pa-0
    class="fund-progress"
  >
    <v-progress-linear
      :value="percent"
      color="primary"
      background-color="white"
      reactive
    >
    </v-progress-linear>
    <div class="value-label t-semi-bold mt-2">
      <div :style="{ position: 'absolute', left: percent + '%', marginLeft: '-10px' }">
        ${{ value }}
      </div>
      <div class="text-right">
        ${{ goal }}
      </div>
    </div>
  </v-container>
</template>

<style lang="scss">
.fund-progress {
  .v-progress-linear {
    height: 0.875em !important;
    border-radius: 0.4375em;
    box-shadow: 0px 0px 4px 0px rgba(4, 15, 15, 0.2),
      1px 4px 4px 0px rgba(4, 15, 15, 0.14),
      0px 0px 0px 0px rgba(4, 15, 15, 0.12);

    .v-progress-linear__determinate {
      border-radius: 0.4375em;

      &.primary {
        background: linear-gradient(25deg, #f7577d 30%, #ff74a3 90%);
      }
    }
  }

  .value-label {
    position: relative;
    font-size: .85em;
  }
}
</style>

<script>
export default {
  props: {
    percent: { // Since actual percent isn't what we always want to display
      type: [Number, String],
      default: 15
    },
    value: {
      type: [Number, String],
      default: 0
    },
    goal: {
      type: [Number, String],
      default: 100
    }
  }
}
</script>
