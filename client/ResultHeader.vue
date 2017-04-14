<template>
  <h5 class="pl-1 grey--text">
    <router-link to="/view/job/" class="no-underline">Jobs</router-link> &raquo;
    <span v-for="(path, index) in paths">
      <span v-if="index > 0"> &raquo; </span>
      <router-link v-if="index != paths.length - 1" :to="{path: '/view/job/' + paths.slice(0, index + 1).join('/') }" class="no-underline">{{ path | pathFilter }}</router-link>
      <span v-else>{{ path | pathFilter }}</span>
    </span>
  </h5>
</template>

<script>

export default {
  name: 'ResultHeader',
  props: {
    title: String
  },
  data: function() {
    const paths = window.location.pathname.replace(/.*?\/job\//, '').split('/');
    return { paths };
  },
  computed: {
    job: function() {
      if (this.paths[0]) {
        return this.paths[0];
      }
      return false;
    },
    build: function() {
      if (this.paths[1]) {
        return this.paths[1];
      }
      return false;
    }
  },
  filters: {
    pathFilter: function(value) {
      if (value.includes('api-test') || value.startsWith('qa-')) {
        return value;
      } else if(value.includes('-site-')) {
        return value.replace('-site-', '-site/');
      } else if (/^[\d-]+$/.test(value)) {
        return '#' + value.replace(/.*-/, '');
      } else if (value.includes('-')) {
        return value.replace(/-/, '/');
      } else {
        return value;
      }
    }
  }
}
</script>
