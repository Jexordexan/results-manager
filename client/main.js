import Vue from 'vue'
import App from './App.vue'

import Home from './Home.vue'

import Jobs from './Jobs.vue'
import Job from './Job.vue'
import Build from './Build.vue'
import Type from './Type.vue'

import Users from './Users.vue'
import User from './User.vue'

import Test from './Test.vue'

import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueClipboard from 'vue-clipboard2'

import moment from 'moment'

Vue.use(Vuetify)
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueClipboard)

// Common Filters
Vue.filter('capitalize', function (value) {
  return value[0].toUpperCase() + value.substring(1)
})

Vue.filter('stripTags', function (value) {
  return value.replace(/#[\w-]+\b/g, '').trim()
})

Vue.filter('tags', function (value) {
  const tags = []
  value.replace(/(#[\w-]+)\b/g, function (match, p1) {
    tags.push(p1)
  })
  return tags.join(' ').trim()
})

Vue.filter('calendar', function (value) {
  return moment(value).calendar()
})

Vue.filter('pluralize', function (string, count, pluralForm) {
  if (count > 1) {
    if (pluralForm) {
      return pluralForm
    } else {
      return string + 's'
    }
  } else {
    return string
  }
})

Vue.filter('numberFormat', function (value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

Vue.filter('jobName', function (value) {
  if (value.includes('api-test') || value.startsWith('qa-')) {
    return value
  } else if (value.includes('-site-')) {
    return value.replace('-site-', '-site/')
  } else {
    return value.replace(/(.*?)-/, '$1/')
  }
})

Vue.filter('buildNumber', function (value) {
  return '#' + value.replace(/\d+-/, '')
})

// Highlight.js directive
Vue.directive('highlightjs', {
  deep: true,
  bind: function (el, binding) {
    // on first bind, highlight all targets
    const targets = el.querySelectorAll('.code-highlight')
    targets.forEach((target) => {
      // if a value is directly assigned to the directive, use this
      // instead of the element content.
      if (binding.value) {
        target.textContent = binding.value
      }
      hljs.highlightBlock(target)
    })
  },
  componentUpdated: function (el, binding) {
    // after an update, re-fill the content and then highlight
    const targets = el.querySelectorAll('.code-highlight')
    targets.forEach((target) => {
      if (binding.value) {
        target.textContent = binding.value
        hljs.highlightBlock(target)
      }
    })
  }
})

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
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    return !savedPosition ? {
      x: 0,
      y: 0
    } : savedPosition
  }
})

// Core instance
new Vue({
  el: '#app',
  template: '<App/>',
  components: {
    App
  },
  router
}).$mount('#app')
