const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpack = require('webpack');
const path = require("path");

module.exports = function (env, argv) {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? 'source-maps' : 'eval',
    entry: {
      main: path.resolve(__dirname, "src", "main.js"),
    },
    output: {
      filename: 'js/[name].[contenthash].js',
      chunkFilename: 'js/[name].[contenthash].js',
      path: path.resolve(__dirname, "build"),
    },
    devServer: {
      contentBase: path.join(__dirname, 'build'),
      open: true,
      overlay: true,
      compress: false,
      port: 9000
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: true }
            }
          ]
        },
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, "src")
          ],
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react"
              ],
              plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        },
        {
          test: /\.(scss|css)$/,
          use: [
            "style-loader",
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            "css-loader",
            "sass-loader"
          ],
        },
        {
          test: /\.md$/i,
          use: 'raw-loader',
        },
        {
          test: /\.(png|jpe?g|gif|mp4|webm)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'media/[ext]/[contenthash]/[name].[ext]'
              }
            },
          ],
        },
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin({ verbose: true }),
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, "src", "index.html"),
        filename: "index.html"
      }),
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash].css",
        chunkFilename: "css/[name].[contenthash].css"
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({})
      ],
      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          },
        }
      }
    },
  };
}