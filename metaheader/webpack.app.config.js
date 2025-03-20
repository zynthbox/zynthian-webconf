const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {app:'./src/app.js'},
  mode: "development",
  devtool: false,
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
              name:'build/bundle/[path][name].[ext]'
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
      // {test: /\.css$/, loader: 'css-loader'},
      {
        test: /\.css$/,   // Match .css files
        use: ["style-loader", "css-loader"], // Process CSS
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js','.jsx'],
    alias: {
      '@components': path.resolve(__dirname, 'components'), 
    },
  },  
  output: {
    path: path.resolve(__dirname, 'build'),   
    filename: "bundle/[name].[contenthash].js",
    chunkFilename: "bundle/chunks/[name].[contenthash].js", 
    asyncChunks:true,    
    clean:false,
    publicPath: '/metaheader/build/'    
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./server/views/index-template.html",
      inject: "body",  // Ensure scripts are injected in the body
      filename: path.resolve(__dirname, "server/views/index.html"),
    }),
  ],
};