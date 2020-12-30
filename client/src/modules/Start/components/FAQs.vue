<template>
  <v-container
    pa-0
    mt-3
  >
    <p class="text-center f-xl t-bold">FAQs</p>
    <v-expansion-panels
      accordion
      flat
    >
      <v-expansion-panel
        v-for="(question, $index) in questions"
        :key="$index">
        <v-expansion-panel-header
          expand-icon=""
          class="py-0"
        >
          <template v-slot:default="{ open }">
            <v-fade-transition leave-absolute>
              <v-icon v-if="open" color="black">mdi-minus</v-icon>
              <v-icon v-else color="black">mdi-plus</v-icon>
            </v-fade-transition>
            <span class="ml-1">{{ question.q }}</span>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="ml-7">
          {{ question.a }}
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style lang="scss">
.v-expansion-panel-header {
  i {
    flex-grow: 0 !important;
  }
  span {
    margin-top: 4px;
  }
}
</style>

<script>
/* eslint-disable quotes */
export default {
  data () {
    return {
      questions: [
        {
          q: `What is Giift?`,
          a: `Giift is a crowdfunding platform for birthday gifts.`
        },
        {
          q: `How does Giift work?`,
          a: `Giift allows you to contribute a small amount of money to each of your friends’ birthdays in the form of pledges. Each of these pledges are added towards a fund that they can use on their birthday to get something they love.`
        },
        {
          q: `When is my account charged?`,
          a: `Your pledges are not charged until 7 days before your friends’ birthdays. You can change your pledge anytime before then.`
        },
        {
          q: `Who created Giift?`,
          a: `Giift was created by four friends who want to make it easier to give and receive gifts people love.`
        },
        {
          q: `Where can I spend my Giift fund?`,
          a: `Your Giift fund is sent to you in the form of a digital gift card that can be used anywhere, similar to a prepaid debit card.`
        },
        {
          q: `How much does it cost to use Giift?`,
          a: `Giift is free to use and we do not charge to make or receive pledges. 7 days before your friends’ birthday, your pledge will be billed + a 2.9% fee required by our credit card processors. When a birthday fund is redeemed, Giift deduct a small service fee (5%) to ensure we can continue to deliver the best service possible.`
        },
        {
          q: `How do I redeem my Giift fund?`,
          a: `On your birthday, you will automatically receive a text message containing the digital gift card in the amount of your fund.`
        },
        {
          q: `Still have questions?`,
          a: `We'd love to hear from you. Email us at hello@giift.app to get in touch.`
        }
      ]
    }
  }
}
</script>
