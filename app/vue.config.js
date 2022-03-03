module.exports = {
  publicPath: '/easy-csv-aggregator/',
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