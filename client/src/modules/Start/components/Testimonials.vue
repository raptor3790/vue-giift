<template>
  <v-container
    fluid
    py-6
    text-center
    class="green-panel"
  >
    <!-- title -->
    <v-row
      align="center"
      justify="center"
      class="f-l t-semi-bold mx-2 mx-sm-8"
    >
      Join 1000s of happy giifters
    </v-row>

    <!-- carousel -->
    <v-row class="mt-3">
      <v-carousel
        touchless
        hide-delimiters
        height="150px"
        class="testimoinal-carousel"
      >
        <v-carousel-item
          v-for="(item, $index) in giifters"
          :key="$index"
          eager
        >
          <div
            class="d-flex flex-column fill-height wrapper carousel-item"
          >
            <div
              class="t-extra-light-italic flex-grow-1 mb-3"
              style="line-height: 1.1rem;"
            >
              "{{ item.quote }}"
            </div>
            <div class="t-bold f-l">
              {{ item.name }}
            </div>
            <div class="f-s">
              {{ item.description }}
            </div>
          </div>
        </v-carousel-item>
      </v-carousel>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      giifters: [
        {
          quote: 'I’m horrible at remembering my friends birthdays. Giift has my back and has made it super easy for me to chip in to each of my friend’s birthdays.',
          name: 'Sam G',
          description: 'Booked a trip to Pittsburgh'
        },
        {
          quote: 'Posting on my friend’s Facebook for their birthday is okay, but I use Giift to go the extra mile and give them something more meaningful.',
          name: 'Gavin G',
          description: 'Purchased a Dell laptop on Amazon'
        },
        {
          quote: 'I had more than 20 people contribute to my birthday and cashed my Giift fund in for a round trip flight to Hawaii. This is honestly really cool.',
          name: 'Ben O',
          description: 'Booked a flight to Hawaii'
        }
      ]
    }
  }
}
</script>
