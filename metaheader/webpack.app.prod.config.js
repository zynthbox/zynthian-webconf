const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {app:'./src/app.js'},
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: { drop_console: true }, // remove console.log
        output: { comments: false } // remove comment
      }
    })]   
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: ["@babel/plugin-transform-runtime"]
          }
        },
        exclude: /node_modules/
      },{
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name:'bundle/[path][name].[ext]'
            },
          },
        ],
      },{ 
        test: /\.(woff|woff2|eot|ttf)$/, 
        use: [
          {
            loader: 'ignore-loader'
          },
        ],
      },
      {test: /\.css$/, loader: 'css-loader'},
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },  
  output: {
    path: path.resolve(__dirname, 'build'),   
    filename: "bundle/[name].[contenthash].js",
    chunkFilename: "bundle/chunks/[name].[contenthash].js", 
    asyncChunks:true,    
    clean:true,
    publicPath: '/metaheader/build/'    
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "../templates/tools-template.html",
      inject: "body",  // Ensure scripts are injected in the body
      filename: path.resolve(__dirname, "../templates/tools.html"),
    }),
  ],
};