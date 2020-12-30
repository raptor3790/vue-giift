<template>
  <v-container
    fluid
    py-6
    mt-6
    text-center
    class="green-panel"
  >
    <!-- title -->
    <v-row
      align="center"
      justify="center"
      class="f-l t-bold mx-8 mx-sm-2"
    >
      Get Something You Love On Your Birthday
    </v-row>

    <!-- not a big fan of vuetify's touch support for the carousel... -->
    <v-row>
      <v-carousel
        touchless
        hide-delimiters
        height="calc((min(100vw, 480px) - 80px) * 0.76 + 80px)"
        class="deal-carousel"
        style="overflow: visible !important;"
      >
        <v-carousel-item
          v-for="(item, $index) in items"
          :key="$index"
          eager
          class="wrapper"
        >
          <v-row
            no-gutters
            align="center"
            justify="center"
            class="fill-height wrapper carousel-item"
          >
            <div
              class="fill-width"
            ></div>
            <v-img
              align="center"
              width="100%"
              height="calc((min(100vw, 480px) - 80px) * 0.76)"
              eager
              :src="item.image"
            />
            <div
              v-if="$index != 0"
              class="badge fill-width f-xl t-bold primary--text d-flex align-center justify-center"
            >
              ${{ item.amount }}
            </div>
            <div class="mx-3 mt-2 fill-width text-center f-xs t-regular">
              {{ item.text }}
            </div>
          </v-row>
        </v-carousel-item>
      </v-carousel>
    </v-row>

    <!-- progress -->
    <v-row>
      <v-col class="wrapper px-12 py-0">
        <fund-progress
          value="10"
          goal="250"
          percent="15"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FundProgress from '@/components/FundProgress'

export default {
  components: {
    FundProgress
  },
  data () {
    return {
      items: [
        {
          amount: 99,
          image: require('@/assets/images/visagiftcard.jpg'),
          text: 'Any retailer, anywhere in the world. Here’s how Giifters are cashing in.'
        },
        {
          amount: 160,
          image: require('@/assets/images/aaptiv.jpg'),
          text: 'Boost your tech. Use your fund on the App or Play Store.'
        },
        {
          amount: 115,
          image: require('@/assets/images/freshly.jpg'),
          text: 'Upgrade your cooking skills. Use your fund for any at-home meal service.'
        },
        {
          amount: 108,
          image: require('@/assets/images/massage.jpg'),
          text: 'Take a breather. Use your fund at any spa or massage service.'
        }
      ]
    }
  }
}
</script>
