<template>
  <v-row>
    <v-progress-linear v-if="jobs.loading" success indeterminate height="4" class="top-loader"></v-progress-linear>
    <v-col xs12="xs12" class="pl-3" v-if="!jobs.loading">
      <h5 class="grey--text">Jobs</h5>
      <v-row row>
        <v-col xs5>
          <v-text-field
            autofocus
            name="filter-input"
            label="Job title"
            v-model="search.job"
            prepend-icon="search">
          </v-text-field>
        </v-col>
        <v-col xs3>
          <v-select :items="buildTypes" v-model="search.type" label="Job type"></v-select>
        </v-col>
        <v-col xs2>
          <v-select :items="sortOptions" v-model="sortBy" label="Sort by" append-icon="sort_by_alpha"></v-select>
        </v-col>
        <v-col xs2>
          <v-btn @click.native="clearFilters" light flat large primary :disabled="!filtersActive()">Reset</v-btn>
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
  data: function () {
    const defaultSort = {
      text: 'Latest build',
      value: '-timestamp',
      icon: 'event'
    }
    return {
      sortOptions: [
        defaultSort,
        {
          text: 'Oldest build',
          value: 'timestamp',
          icon: 'event'
        },
        {
          text: 'Job title (A → Z)',
          value: 'job',
          icon: 'label-outline'
        },
        {
          text: 'Job title (Z → A)',
          value: '-job',
          icon: 'label-outline'
        }
      ],
      buildTypes: [
        {
          text: 'All jobs',
          value: ''
        },
        {
          divider: true
        },
        {
          text: 'All UI test jobs',
          value: 'uitest'
        },
        {
          text: 'All precommit jobs',
          value: 'precommit'
        },
        {
          text: 'All main jobs',
          value: 'main'
        }
      ],
      sortBy: defaultSort,
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
    filterJobs: function (items) {
      return items.filter(item => {
        for (const filterKey in this.search) {
          const value = item[filterKey].toString()
          let test = this.search[filterKey]
          if (typeof test === 'object') test = test.value
          if (value.indexOf(test || '') === -1) return false
        }
        return true
      }).sort((a, b) => {
        let score
        let compareField = (this.sortBy && this.sortBy.value) || '-timestamp'
        let multiplier = 1
        if (compareField.charAt(0) === '-') {
          multiplier = -1
          compareField = compareField.substring(1)
        }

        if (typeof a[compareField] === 'string') { score = a[compareField].localeCompare(b[compareField]) } else { score = a[compareField] - b[compareField] }

        return score * multiplier
      })
    },
    clearFilters: function () {
      this.search = {
        job: '',
        latest: '',
        type: ''
      }
      this.sortBy = this.sortOptions[0]
    },
    filtersActive: function () {
      return Object.keys(this.search).some(i => this.search[i]) || this.sortBy !== this.sortOptions[0]
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
