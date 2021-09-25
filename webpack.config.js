const path = require('path');
const Dotenv = require('dotenv-webpack');
// const webpack = require('webpack');

module.exports = {
  entry: './src/javascripts/api.js', // webpack 打包的起始檔案
  plugins: [
    new Dotenv()
  ],
  output: {
    path: path.resolve(__dirname, 'public'), // 打包完的檔案位置
    filename: 'api.min.js' // 打包後輸出的檔名
  }
  // optimization: {
  //   // We no not want to minimize our code.
  //   // https://github.com/serverless-heaven/serverless-webpack/issues/345
  //   minimize: false
  // }
};
