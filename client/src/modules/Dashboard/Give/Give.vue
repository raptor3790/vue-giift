<template>
  <div>
    <add-friends
      v-if="addingFriends"
      @cancel="stopAdding"
      @finish="stopAdding"
    />
    <my-pledges
      v-else
      @add-friends="startAdding"
    />
  </div>
</template>

<script>
import MyPledges from './MyPledges'
import AddFriends from './AddFriends'

export default {
  components: {
    MyPledges,
    AddFriends
  },
  computed: {
    addingFriends () {
      return this.$route.query && this.$route.query.add + '' === '1'
    }
  },
  methods: {
    startAdding () {
      this.$router.push({ query: { ...this.$route.query || {}, add: 1, step: 1 } })
    },
    stopAdding () {
      this.$router.push({ query: { p: 'give' } })
    }
  }
}
</script>
