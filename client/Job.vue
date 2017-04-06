<template>
  <v-row v-if="!job.loading">
    <v-col xs12="xs12" class="pl-3">
      <ResultHeader></ResultHeader>
      <v-list>
        <v-list-item v-for="item in job.items" v-bind:key="item.job">
          <v-list-tile avatar class="no-action">
            <v-list-tile-avatar>
              <v-icon v-if="item.failed === 0" class="green--text">label</v-icon>
              <v-icon v-else class="red--text">label</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                <router-link :to="{ path: '/view/job/' + job.name }">{{ job.name | jobName }}</router-link> &raquo;
                <router-link :to="{ path: '/view/job/' + job.name + '/' + item.build}">{{ item.build | buildNumber }}</router-link>
              </v-list-tile-title>
              <v-list-tile-sub-title>{{ item.timestamp | moment }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import ResultHeader from './ResultHeader.vue';

export default {
  name: 'Job',
  components: {
    ResultHeader
  },
  data: function() {
    return {
      job: { name: '', loading: true }
    };
  },
  filters: {
    moment: function(value) {
      return moment(value).calendar();
    },
    jobName: function(value) {
      if (value.includes('api-test')) {
        return value;
      } else if (value.includes('-site')) {
        return value.replace('-site', '-site/');
      } else {
        return value.replace(/(.*?)-/, '$1/');
      }
    },
    buildNumber: function(value) {
      return '#' + value.replace(/\d+-/, '');
    }
  },
  methods: {
    getData: function() {
      var vm = this;
      var dataUrl = window.location.pathname.replace('/view/', '/data/');
      return axios.get(dataUrl).
        then(function(response) {
          vm.job.items = response.data.items;
          vm.job.name = response.data.job;
          vm.job.loading = false;
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
