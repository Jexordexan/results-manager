import Vue from 'vue';
import App from './App.vue';

import Home from './Home.vue';

import Jobs from './Jobs.vue';
import Job from './Job.vue';
import Build from './Build.vue';
import Type from './Type.vue';

import Users from './Users.vue';
import User from './User.vue';

import Test from './Test.vue';

import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';

Vue.use(Vuetify)
Vue.use(VueRouter);
Vue.use(VueClipboard);

// Common Filters
Vue.filter('capitalize', function(value) {
  return value[0].toUpperCase() + value.substring(1);
});

Vue.filter('stripTags', function(value) {
  return value.replace(/#[\w-]+\b/g, '').trim();
});

Vue.filter('tags', function(value) {
  const tags = [ ];
  value.replace(/(#[\w-]+)\b/g, function(match, p1) {
    tags.push(p1);
  });
  return tags.join(' ').trim();
});

Vue.filter('calendar', function(value) {
  return moment(value).calendar();
});

Vue.filter('pluralize', function(string, count, pluralForm) {
  if (count > 1) {
    if (pluralForm) {
      return pluralForm;
    } else {
      return string + 's';
    }
  } else {
    return string;
  }
});

Vue.filter('numberFormat', function(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

// Highlight.js directive
Vue.directive('highlightjs', {
  deep: true,
  bind: function(el, binding) {
    // on first bind, highlight all targets
    let targets = el.querySelectorAll('.code-highlight')
    targets.forEach((target) => {
      // if a value is directly assigned to the directive, use this
      // instead of the element content.
      if (binding.value) {
        target.textContent = binding.value
      }
      hljs.highlightBlock(target)
    })
  },
  componentUpdated: function(el, binding) {
    // after an update, re-fill the content and then highlight
    let targets = el.querySelectorAll('.code-highlight')
    targets.forEach((target) => {
      if (binding.value) {
        target.textContent = binding.value
        hljs.highlightBlock(target)
      }
    })
  }
});

// Routes
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/view/job',
    component: Jobs
  },
  {
    path: '/view/job/:job',
    component: Job
  },
  {
    path: '/view/job/:job/:build',
    component: Build
  },
  {
    path: '/view/job/:job/:build/:type',
    component: Type
  },
  {
    path: '/view/job/:job/:build/:type/:name',
    component: Test
  },
  {
    path: '/view/job/:job/:build/:type/:name',
    component: Test
  },
  {
    path: '/view/user',
    component: Users
  },
  {
    path: '/view/user/:user',
    component: User
  },
  // Fallback
  {
    path: '*',
    component: Home
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

// Core instance
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  router
}).$mount('#app');
