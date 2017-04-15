<template>
  <v-card>
    <v-card-row :class="headerColor">
      <v-card-title>
        <span class="white--text">
          {{ build.job | pathFilter }} &raquo; {{ build.build | pathFilter }}
          <span v-if="build.type"> &raquo; {{ build.type | pathFilter }}</span>
        </span>
      </v-card-title>
    </v-card-row>
    <v-card-text>
      <v-card-row height="50px">
        <v-icon class="mr-5 grey--text">label_outline</v-icon>
        <div>
          <div>Build Type</div>
          <strong>{{ build.buildType | capitalize }}</strong>
        </div>
      </v-card-row>

      <v-card-row>
        <v-icon class="mr-5 grey--text">event</v-icon>
        <div>
          <div>Timestamp</div>
          <strong>{{ build.timestamp | calendar }}</strong>
        </div>
      </v-card-row>

      <v-card-row>
        <img src="/static/git.svg" width="24" height="24" class="icon mr-5">
        <div>
          <div>Branch <span class="grey--text">/</span> Hash</div>
          <a :href="'https://github.com/onshape/newton/tree/' + build.branch">{{ build.branch }}</a>
          <span class="grey--text"> / </span>
          <a :href="'https://github.com/onshape/newton/commit/' + build.hash">{{ build.hash | short }}</a>
        </div>
      </v-card-row>

      <v-card-row>
        <v-icon v-if="build.culprits.length === 1" class="mr-5 grey--text">person_outline</v-icon>
        <v-icon v-else class="mr-5 grey--text">people_outline</v-icon>
        <div>
          <div>{{ 'Committer' | pluralize(build.culprits.length) }}</div>
          <span v-for="(person, index) in build.culprits" :key="person">
            <span v-if="index > 0">, </span>
            <router-link :to="{ path: '/view/user/' + person }">{{ person }}</router-link>
          </span>
        </div>
      </v-card-row>

      <v-card-row>
        <v-icon class="mr-5 grey--text">folder</v-icon>
        <div>
          <div>Jenkins Build</div>
          <a :href="build.buildUrl">{{ build.buildUrl }}</a>
        </div>
      </v-card-row>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'BuildCard',
  props: {
    build: Object
  },
  data: function () {
    return { }
  },
  computed: {
    headerColor: function () {
      if (this.build.fail.length === 0) {
        return 'green darken-1'
      } else {
        return 'red'
      }
    }
  },
  filters: {
    pathFilter: function (value) {
      if (value.includes('api-test') || value.startsWith('qa-')) {
        return value
      } else if (value.includes('-site-')) {
        return value.replace('-site-', '-site/')
      } else if (/^[\d-]+$/.test(value)) {
        return '#' + value.replace(/.*-/, '')
      } else if (value.includes('-')) {
        return value.replace(/-/, '/')
      } else {
        return value
      }
    },
    short: function (value) {
      return value.substring(0, 12)
    }
  }
}
</script>
