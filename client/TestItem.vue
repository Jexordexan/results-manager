<template>
  <li>
    <div v-if="isRoot">
      <ResultHeader></ResultHeader>
       <h4>
        <span class="grey--text text--darken-2">[{{model.type | capitalize}}]</span> {{model.title | stripTags}}<span class="pl-2 purple--text text--lighten-1">{{model.title | tags}}</span>
        <v-chip small :class="color" class="white--text">
          {{model.state | capitalize}}
        </v-chip>
      </h4>
      <div v-if="failed">Reproduce locally: <span class="snippet pr-2">$ {{command}} <span v-tooltip:bottom="{ html: copyTooltip }" v-clipboard:copy="command" v-clipboard:success="onCopy"><v-icon class="grey--text text--darken-2 icon--button">assignment_return</v-icon></span></span>
        <br><br></div>
      <span :class="{bold: isFolder}">{{model.title | stripTags}}</span><span class="pl-1 purple--text text--lighten-1">{{model.title | tags}}</span> {{duration}}
    </div>
    <div v-if="!isRoot" @click="toggle">
      <v-icon v-if="passed" class="green--text icon--tiny bold" title="Passed">done</v-icon>
      <v-icon v-else-if="failed" class="red--text icon--tiny bold" title="Failed">clear</v-icon>
      <v-icon v-else class="cyan--text icon--tiny bold" title="Skipped">remove</v-icon>
      <span :class="{bold: isFolder}">{{model.title | stripTags}}</span><span class="pl-1 purple--text text--lighten-1">{{model.title | tags}}</span> {{duration}}
      <span v-if="isFolder">
        <v-icon v-if="open" class="grey--text text--darken-1 icon--tiny bold">expand_more</v-icon>
        <v-icon v-if="!open" class="grey--text text--darken-1 icon--tiny bold">chevron_right</v-icon>
      </span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <li class="pl-3" v-for="attachment in model.attachments">
        <div class="bold">{{attachment.title}}</div>
        <img :src="'data:image/png;base64,' + attachment.data" class="attachment-image">
      </li>
      <li class="pl-3" v-for="error in model.errors">
        Error:<br>
        <pre class="snippet ">{{error.stack | trim}}</pre>
      </li>
      <li class="pl-3" v-if="model.code">
        Code:<br>
        <pre class="snippet" v-highlightjs="model.code"><div class="code-highlight javascript"></div></pre>
      </li>
      <TestItem class="item" v-for="model in model.children" :model="model" :key="model.title"></TestItem>
    </ul>
    <div v-if="isRoot">
      <br>
      <div v-for="item in model.logs">
        <v-chip label class="white">
          <v-avatar class="grey--text">
            <v-icon>insert_drive_file</v-icon>
          </v-avatar>
          {{item.name}}
        </v-chip>
        <pre class="snippet" v-highlightjs="item.data"><div class="code-highlight acesslog"></div></pre>
      </div>
    </div>
    <div v-if="isRoot">
      <v-chip label class="white">
        <v-avatar class="grey--text">
          <v-icon>event</v-icon>
        </v-avatar>
        {{ model.timestamp | calendar}}
      </v-chip>
      <br>
      <v-chip label class="white">
        <v-avatar class="grey--text">
          <v-icon>person_outline</v-icon>
        </v-avatar>
        <span v-for="(person, index) in model.culprits" :key="person">
          <span v-if="index > 0">, </span>
          <router-link :to="{ path: '/view/user/' + person }">{{ person }}</router-link>
        </span>
      </v-chip>
      <br>
      <v-chip label class="white">
        <v-avatar>
          <img src="/static/git.svg">
        </v-avatar>
        <a :href="'https://github.com/onshape/newton/commit/' + model.hash">{{ model.hash | short }}</a>
      </v-chip>
      <br>
      <v-chip label class="white">
        <v-avatar class="grey--text">
          <v-icon>folder</v-icon>
        </v-avatar>
        <a :href="model.buildUrl">Jenkins Build</a>
      </v-chip>
    </div>
  </li>
</template>

<script>
import ResultHeader from './ResultHeader.vue';

export default {
  name: 'TestItem',
  props: {
    model: Object
  },
  data: function () {
    return {
      open: (this.model.name || this.model.state === 'failed') ? true : false,
      copyTooltip: 'Copy to clipboard'
    }
  },
  components: {
    ResultHeader
  },
  computed: {
    isFolder: function () {
      if (this.model.children && this.model.children.length) {
        return true;
      }
      if (this.model.attachments && this.model.attachments.length) {
        return true;
      }
      if (this.model.code || this.model.stack) {
        return true;
      }
      return false;
    },
    isRoot: function () {
      return this.model.name;
    },
    passed: function() {
      return this.model.state === 'passed';
    },
    failed: function() {
      return this.model.state === 'failed';
    },
    skipped: function() {
      return this.model.state === 'skipped';
    },
    duration: function() {
      if (this.model.duration) {
        if (this.model.duration > 60000) {
          return '(' + (this.model.duration / 60000).toFixed(1) + ' m)';
        } else if (this.model.duration > 1000) {
          return '(' + (this.model.duration / 1000).toFixed(1) + ' s)';
        } else {
          return '(' + this.model.duration + ' ms)';
        }
      } else {
        return '';
      }
    },
    color: function() {
      if (this.model.state === 'passed') {
        return 'green';
      } else if (this.model.state === 'failed') {
        return 'red';
      } else {
        return 'blue';
      }
    },
    command: function() {
      if (this.model.type === 'protractor') {
        return 'ptor ' + this.model.name;
      } else if (this.model.type === 'mocha') {
        return 'mocha ' + this.model.name;
      } else {
       return '';
      }
    },
    type: function() {
     if (this.model.buildType === 'main') {
       return 'jenkins';
     } else {
       return this.model.buildType;
     }
   },
   jobUrl: function() {
     return '/view/job/' + this.model.job;
   }
  },
  methods: {
    onCopy: function() {
      this.copyTooltip = 'Copied!'
    },
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    }
  },
  filters: {
    short: function(value) {
      return value.substring(0, 12);
    },
    trim: function(value) {
      return value.trim();
    }
  }
}
</script>
