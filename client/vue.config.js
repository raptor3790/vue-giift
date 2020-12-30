module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  css: {
    loaderOptions: {
      scss: {
        prependData: `
          @import '@/assets/typo.scss';
        `
      }
    }
  },
  devServer: {
    disableHostCheck: true,
    proxy: {
      '^/api/': {
        target: process.env.API_PROXY || 'http://www.giift.app',
        ws: true,
        secure: true,
        changeOrigin: true
      },
      '^/a/': {
        target: process.env.API_PROXY || 'http://www.giift.app',
        ws: true,
        secure: true,
        changeOrigin: true
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? 'https://s3.amazonaws.com/cdn.giift.app/client/latest/' : '/',
  filenameHashing: false,
  pwa: {
    iconPaths: {
      favicon32: '/favicon.png'
    }
  }
}
