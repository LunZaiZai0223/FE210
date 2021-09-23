const path = require('path');
const Dotenv = require('dotenv-webpack');
// const webpack = require('webpack');

module.exports = {
  entry: './api.js', // webpack 打包的起始檔案
  plugins: [
    // new webpack.EnvironmentPlugin({
    //   CLIENTID: 'v4cbdvjc8zf6pj6mrogkycdx0h51z0',
    //   OAUTHTOKEN: 'Bearer 6enwr0jv7bz7r9jc1lzenekqckxq7z'
    // }),
    new Dotenv()
  ],
  output: {
    path: path.resolve(__dirname, 'dist'), // 打包完的檔案位置
    filename: 'api.min.js' // 打包後輸出的檔名
  }
  // optimization: {
  //   // We no not want to minimize our code.
  //   // https://github.com/serverless-heaven/serverless-webpack/issues/345
  //   minimize: false
  // }
};
