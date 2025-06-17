const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpeg|gif|svg|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      favicon: './src/assets/img/raccoon.png',
      templateParameters: {
        BASE_HREF: isProduction ? '/andreitsen-rss-final-ecommerce-app/' : '/',
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '_redirects',
          to: '',
        },
      ],
    }),
    new DotenvWebpackPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
};

module.exports = () => {
  return config;
};
