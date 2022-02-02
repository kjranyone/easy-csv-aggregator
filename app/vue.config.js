module.exports = {
  publicPath: '/wordle-ja-cheat/',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devServer: {
      watchOptions: {
        poll: true
      }
    }
  }
}