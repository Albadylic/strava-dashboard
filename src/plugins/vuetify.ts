import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#FC4C02',
          secondary: '#2D2D2D',
          surface: '#1E1E1E',
          background: '#121212',
          'on-primary': '#FFFFFF',
          'on-surface': '#E0E0E0',
          'on-background': '#E0E0E0',
          error: '#CF6679',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
    },
  },
})
