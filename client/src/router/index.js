import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/modules/Home'
import get from 'lodash/get'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter (to, from, next) {
      const store = require('../store').default
      if (get(store, 'getters.user.id') || get(window, 'initialState.state.userId')) {
        return next({ name: 'Dashboard' })
      }
      next()
    }
  },
  {
    path: '/start/:pledgeId',
    name: 'Start',
    component: () => import(/* webpackChunkName: "start" */ '@/modules/Start')
  },
  {
    path: '/activated/:pledgeId',
    name: 'Activated',
    component: () => import(/* webpackChunkName: "activated" */ '@/modules/Start/Activated'),
    meta: { auth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/modules/Login')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/modules/Dashboard'),
    meta: { auth: true }
  },
  {
    path: '/faq',
    name: 'Faq',
    component: () => import(/* webpackChunkName: "faq" */ '@/modules/Faq')
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import(/* webpackChunkName: "about" */ '@/modules/About')
  // },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "account" */ '@/modules/Account'),
    meta: { auth: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import(/* webpackChunkName: "terms" */ '@/modules/Terms')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import(/* webpackChunkName: "privacy" */ '@/modules/Privacy')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "aa" */ '@/modules/Admin')
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  console.log('route to', to, 'from', from)
  const store = require('../store').default
  if (get(to, 'meta.auth') && !get(store, 'getters.user') && !get(window, 'initialState.state.userId')) {
    console.log('not authed, route to login')
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

window.$router = router

export default router
