const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/ts/floornav.ts',
  output: {
    filename: 'floornav.min.js',
  },
  resolve: {
    extensions: [ '.js', '.ts', '.tsx'],
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
        }],
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/tpl/index.html'
    })
  ]
}
