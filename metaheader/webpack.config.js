const path = require('path');

module.exports = {
  entry: './src/index.js',
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
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, ''),
    filename: 'metaheader-bundle.js',
  },
  output: {
    path: path.resolve(__dirname, ''),
    filename: 'metaheader-bundle.js',
    chunkFilename: 'bundle/metaheader.[id].js',
    publicPath: '/metaheader/'
  },
};