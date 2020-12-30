import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import '@/assets/global-styles.scss'
import moment from 'moment'

Vue.config.productionTip = false

Vue.prototype.moment = moment

const bootstrap = async () => {
  if (!Object.entries(window.initialState || {}).length) {
    await store.dispatch('loadSession', { hideErrors: true })
  }

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

bootstrap()
