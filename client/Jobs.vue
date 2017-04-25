<template>
  <v-row>
    <v-progress-linear v-if="jobs.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
    <v-col xs12="xs12" class="pl-3" v-if="!jobs.loading">
      <h5 class="grey--text">Jobs</h5>
      <v-divider></v-divider>
      <v-row row>
        <v-col xs5>
          <v-text-field
            name="filter-input"
            label="Filter"
            v-model="search.job"
            prepend-icon="search">
          </v-text-field>
        </v-col>
        <v-col xs1>
          <v-subheader>Show:</v-subheader>
        </v-col>
        <v-col xs3>
          <v-select :items="buildTypes" v-model="search.type"></v-select>
        </v-col>
        <v-col xs2>
          <v-btn @click="clearFilters()" light flat large>Clear</v-btn>
        </v-col>
      </v-row>
      <v-list>
        <v-list-item v-for="item in filterJobs(jobs.items)" v-bind:key="item.job">
          <v-list-tile avatar class="no-action">
            <v-list-tile-avatar>
              <v-icon v-if="item.lastFailed === 0" class="green--text">label</v-icon>
              <v-icon v-else class="red--text">label</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                <router-link :to="{ path: '/view/job/' + item.job }">{{ item.job | jobName }}</router-link> &raquo;
                <router-link :to="{ path: '/view/job/' + item.job + '/' + item.latest}">{{ item.latest | buildNumber }}</router-link></v-list-tile-title>
              <v-list-tile-sub-title>{{ item.timestamp | calendar }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Jobs',
  data: function() {
    return {
      buildTypes: [
        {text: 'All jobs', value: ''},
        {text: 'uitest', value: 'uitest'},
        {text: 'precommit', value: 'precommit'},
        {text: 'main', value: 'main'}
      ],
      search: {
        job: '',
        latest: '',
        type: ''
      },
      jobs: {
        loading: true
      }
    }
  },
  filters: {},
  methods: {
    getData: function () {
      const vm = this
      const dataUrl = window.location.pathname.replace('/view/', '/data/')
      return this.$http.get(dataUrl)
        .then(function (response) {
          vm.jobs.items = response.body
          vm.jobs.loading = false
          return response.body
        })
    },
    filterJobs: function(items) {
      return items.filter(item => {
        for (let filterKey in this.search) {
          const value = item[filterKey].toString();
          let test = this.search[filterKey] || '';
          if (typeof test === 'object') test = test.value;
          if (value.indexOf(test) === -1) return false;
        }
        return true;
      });
    },
    clearFilters: function() {
      this.search = {
        job: '',
        latest: '',
        type: ''
      }
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
