<template>
  <v-row>
    <v-progress-linear v-if="build.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
    <v-col xs6="xs6" class="pl-3" v-if="!build.loading">
      <ResultHeader></ResultHeader>
      <v-list>
        <BuildItem v-for="item in build.fail" :item="item" :build="build" :key="item.build"></BuildItem>
        <BuildItem v-for="item in build.pass" :item="item" :build="build" :key="item.build"></BuildItem>
        <BuildItem v-for="item in build.skip" :item="item" :build="build" :key="item.build"></BuildItem>
      </v-list>
    </v-col>
    <v-col xs5="xs5" class="pl-3" v-if="!build.loading">
      <BuildCard :build="build"></BuildCard>
    </v-col>
  </v-row>
</template>

<script>
import BuildItem from './BuildItem.vue'
import BuildCard from './BuildCard.vue'
import ResultHeader from './ResultHeader.vue'

export default {
  name: 'Build',
  data: function () {
    return {
      build: {
        loading: true
      }
    }
  },
  components: {
    BuildCard,
    BuildItem,
    ResultHeader
  },
  filters: {},
  methods: {
    getData: function () {
      const vm = this
      const dataUrl = window.location.pathname.replace('/view/', '/data/')
      return this.$http.get(dataUrl)
        .then(function (response) {
          vm.build = Object.assign({}, vm.build, response.body)
          vm.build.loading = false
          return response.body
        })
    }
  },
  created: function () {
    this.getData()
  },
  watch: {
    '$route': function (to, from) {
      this.getData()
    }
  }
}
</script>
