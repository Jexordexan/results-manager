<template>
  <v-list-item>
    <v-list-tile avatar class="no-action">
      <v-list-tile-avatar>
        <v-icon :class="stateColor">{{item.state | iconState}}</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>
          <router-link :to="{path: '/view/job/' + build.job + '/' + build.build + '/' + item.type + '/' + item.name}">{{item.title | stripTags}}</router-link><span class="pl-2 purple--text text--lighten-1">{{item.title | tags}}</span>
        </v-list-tile-title>
        <v-list-tile-sub-title>
          <router-link :to="{path: '/view/job/' + build.job + '/' + build.build + '/' + item.type}" class="build-item-link">
            {{item.type | capitalize}}
            <v-icon class="pl-1 icon--tiny grey--text">{{item.type | iconType }}</v-icon>
          </router-link>
        </v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list-item>
</template>

<script>
export default {
  name: 'BuildItem',
  props: {
    item: Object,
    build: Object
  },
  data: function() {
    return {};
  },
  computed: {
    stateColor: function() {
       if (this.item.state === 'passed') {
         return 'green--text bold';
       } else if (this.item.state === 'failed') {
         return 'red--text bold';
       } else {
         return 'cyan--text bold'
       }
    }
  },
  filters: {
     iconType: function(value) {
       if(value === 'protractor') {
         return 'computer';
       } else if (value === 'mocha') {
         return 'code';
       } else {
         return value;
       }
    },
    iconState: function(value) {
       if(value === 'passed') {
         return 'done';
       } else if (value === 'failed') {
         return 'clear';
       } else {
         return 'remove';
       }
    }
  }
}
</script>
