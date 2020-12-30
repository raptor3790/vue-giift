import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import { sync } from 'vuex-router-sync'
import router from '@/router'
import { addRecordsToStore, clearForLogout, registerModels, Pledge, User } from '@/models'
import get from 'lodash/get'

axios.interceptors.request.use((config) => {
  store.commit('setAppError', null)
  const skipHeaders = (get(config, 'skipHeaders') || []).map(h => ((h || '') + '').toLowerCase())

  config.headers = {
    ...(config.headers || {})
  }
  if (store.getters && store.getters.accountId && !skipHeaders.includes('x-account-id') && config.headers['x-account-id'] === undefined) {
    config.headers['x-account-id'] = store.getters.accountId + ''
  }
  return config
})

axios.interceptors.response.use((response) => {
  // Add records to store returned from any request
  if (response && response.data && response.data.records) {
    addRecordsToStore(response.data.records)
  }
  return response
}, (error) => {
  const store = require('./index').default
  let message = error.message
  if (error.response) {
    message = get(error.response, 'data.error') || get(error.response, 'data') || message
  }
  if (!(error.config && error.config.hideErrors)) {
    if ((get(error.response, 'status') || '') + '' === '401') {
      store.commit('setAppError', 'You are not authorized.  Please log in.')
    } else {
      store.commit('setAppError', message)
    }
  }
  throw error
})

Vue.use(Vuex)
VuexORM.use(VuexORMAxios, {
  axios,
  baseURL: '/api/v1/',
  dataTransformer: ({ data, headers }) => {
    // Do stuff with data...
    if (data && data.data) {
      return data.data
    }
  }
})

const database = new VuexORM.Database()

registerModels(database)

const store = new Vuex.Store({
  plugins: [VuexORM.install(database)],
  state: {
    nav: false,
    login: false,
    userId: null,
    newUser: null,
    initialPledgeId: null,
    appError: null,
    newPledges: null,
    ...(get(window.initialState, 'state') || {})
  },
  getters: {
    user (state) {
      if (state.userId) {
        return User.find(state.userId)
      }
      return state.newUser || null
    },
    initialPledge (state) {
      if (state.initialPledgeId) {
        return Pledge.query().withAll().whereId(state.initialPledgeId).first()
      }
      return null
    }
  },
  mutations: {
    setNav (state, nav) {
      state.nav = nav
    },
    setAppError (state, value) {
      state.appError = value
      setTimeout(() => {
        if (state.appError === value) {
          state.appError = null
        }
      }, 5000)
    },
    setLogin (state, login) {
      state.login = login
    },
    setInitialState (state, initialState) {
      Object.entries(initialState || {})
        .forEach(([key, value]) => (state[key] = value))
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUser (state, user) {
      User.insert({ data: user })
      state.userId = user.id
    },
    setInitialPledgeId (state, id) {
      state.initialPledgeId = id
    },
    setNewUser (state, props = {}) {
      if (props === null) {
        state.newUser = null
      } else {
        state.newUser = {
          ...(state.newUser || {}),
          ...props
        }
      }
    },
    setNewPledges (state, pledges) {
      state.newPledges = pledges
    }
  },
  actions: {
    async loadSession ({ commit }, requestConfig = {}) {
      // Request the current session if we don't have it already
      try {
        const response = await axios({
          ...requestConfig,
          method: 'GET',
          url: '/api/v1/auth'
        })

        if (response.data && response.data.state) {
          // Records should be automatically handled
          store.commit('setInitialState', response.data.state)
        }
      } catch (e) {
        if (e.response && e.response.status && e.response.status + '' !== '401') {
          // Do nothing if this doesn't work out
          commit('setAppError', get(e, 'response.data.error') || get(e, 'response.data') || e.message)
        }
        // If unauthorized then let the route handlers take it from here
      }
    },
    async logout ({ commit }) {
      await axios({
        method: 'DELETE',
        url: '/api/v1/auth'
      })

      window.initialState = null

      commit('setNewUser', null)
      commit('setInitialPledgeId', null)
      commit('setUserId', null)
      commit('setNewPledges', null)

      // Delete all data in the store
      clearForLogout()

      // Go to default page
      router.push({ path: '/' })
    }
  },
  modules: {
  }
})

if (window.initialState && window.initialState.records) {
  addRecordsToStore(window.initialState.records)
}

sync(store, router)

window.$store = store

export default store
