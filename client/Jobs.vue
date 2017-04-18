<template>
  <v-row>
    <v-progress-linear v-if="jobs.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
    <v-col xs12="xs12" class="pl-3" v-if="!jobs.loading">
      <h5 class="grey--text">Jobs</h5>
      <v-list>
        <v-list-item v-for="item in jobs.items" v-bind:key="item.job">
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
  data: function () {
    return {
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
