<template>
  <v-app id="app" top-toolbar>
    <v-toolbar>
      <v-toolbar-title><router-link to="/" class="logo-link">Onshape Results Manager</router-link></v-toolbar-title>
      <v-toolbar-items>
        <v-toolbar-item router to="/view/job">Jobs</v-toolbar-item>
        <v-toolbar-item router to="/view/user">Users</v-toolbar-item>
        <!-- <v-toolbar-item router to="/view/fingerprint">Fingerprints</v-toolbar-item> -->
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="stylus">
  @import '../node_modules/vuetify/src/stylus/main'
  @import './main.css'
</style>
