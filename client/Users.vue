<template>
  <v-row v-if="!users.loading">
    <v-col xs12="xs12" class="pl-3">
      <h5 class="grey--text pl-3">Users</h5>
      <v-divider></v-divider>
      <v-list>
        <v-list-item v-for="item in users.items" v-bind:key="item.job">
          <v-list-tile avatar class="no-action">
            <v-list-tile-avatar>
              <v-icon class="grey--text">person_outline</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                <router-link :to="{ path: '/view/user/' + item.user}">{{ item.user }}</router-link>
              </v-list-tile-title>
              <v-list-tile-sub-title>{{ item.jobs | numberFormat }} {{ 'job' | pluralize(item.jobs) }}, {{ item.builds | numberFormat }} {{ 'build' | pluralize(item.builds) }}, {{ item.tests | numberFormat }} {{ 'test' | pluralize(item.tests) }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Users',
  data: function () {
    return {
      users: {
        loading: true
      }
    }
  },
  filters: {},
  methods: {
    getData: function () {
      const vm = this
      const dataUrl = window.location.pathname.replace('/view/', '/data/')
      return axios.get(dataUrl)
        .then(function (response) {
          vm.users.items = response.data.items
          vm.users.loading = false
          return response
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
