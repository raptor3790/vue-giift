import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#f7577d',
        inactive: '#E5E7E7',
        white: '#FCFCFC',
        black: '#040F0F'
      }
    }
  }
})
