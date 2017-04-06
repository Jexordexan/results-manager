<template>
 <v-row v-if="!report.loading"><v-col xs12="xs12"><ul><TestItem :model="report"></TestItem></ul></v-col></v-row>
</template>

<script>
import TestItem from './TestItem.vue';

export default {
  name: 'TestResult',
  components: {
    TestItem
  },
  data: function() {
    return {
      report: { loading: true }
    };
  },
  methods: {
    getData: function() {
      var vm = this;
      var dataUrl = window.location.pathname.replace('/view/', '/data/');
      return axios.get(dataUrl).
        then(function(response) {
          vm.report = response.data;
          vm.title = response.data.title;
          return response;
        });
    }
  },
  created: function() {
    this.getData();
  },
  watch: {
    '$route': function(to, from) {
      this.getData();
    }
  }
}
</script>
