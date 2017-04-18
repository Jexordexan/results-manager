<template>
 <v-row>
   <v-progress-linear v-if="report.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
   <v-col xs12="xs12">
     <ul>
       <TestItem v-if="!report.loading" :model="report"></TestItem>
     </ul>
   </v-col>
 </v-row>
</template>

<script>
import TestItem from './TestItem.vue'

export default {
  name: 'TestResult',
  components: {
    TestItem
  },
  data: function () {
    return {
      report: {
        loading: true
      }
    }
  },
  methods: {
    getData: function () {
      const vm = this
      const dataUrl = window.location.pathname.replace('/view/', '/data/')
      return this.$http.get(dataUrl)
        .then(function (response) {
          vm.report = response.body
          vm.title = response.body.title
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
