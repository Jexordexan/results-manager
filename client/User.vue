<template>
  <v-row>
    <v-progress-linear v-if="user.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
    <v-col xs6="xs6" class="pl-3" v-if="!user.loading">
      <h5 class="grey--text">
        <router-link to="/view/user/" class="no-underline">Users</router-link> &raquo; {{ user.user }}
      </h5>
      <v-list>
        <v-list-item v-for="item in user.items" v-bind:key="item.job">
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
    <v-col xs3="xs3" class="pl-3" v-if="!user.loading">
      <v-card>
        <v-card-row class="blue">
          <v-card-title>
            <span class="white--text">
              Users &raquo; {{ user.user }}
            </span>
          </v-card-title>
        </v-card-row>

        <v-card-text>
          <v-card-row height="50px">
            <v-icon class="mr-5 grey--text">label_outline</v-icon>
            <div>
              <div>{{ 'Job' | pluralize(user.jobs) }}</div>
              <strong>{{ user.jobs | numberFormat }}</strong>
            </div>
          </v-card-row>
        </v-card-text>

        <v-card-text>
          <v-card-row height="50px">
            <v-icon class="mr-5 grey--text">build</v-icon>
            <div>
              <div>{{ 'Build' | pluralize(user.builds) }}</div>
              <strong>{{ user.builds | numberFormat }}</strong>
            </div>
          </v-card-row>
        </v-card-text>

        <v-card-text>
          <v-card-row height="50px">
            <v-icon class="mr-5 grey--text">done_all</v-icon>
            <div>
              <div>{{ 'Test' | pluralize(user.tests) }}</div>
              <strong>{{ user.tests | numberFormat }}</strong>
            </div>
          </v-card-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'User',
  data: function () {
    return {
      user: {
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
          vm.user = Object.assign({}, vm.user, response.body)
          vm.user.loading = false
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
