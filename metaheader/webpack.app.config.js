const path = require('path');

module.exports = {
  entry: './src/app.js',
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
    path: path.resolve(__dirname, ''),
    filename: 'app-bundle.js',
    asyncChunks:true,
    chunkFilename: 'bundle/app/app.[id].js',
    publicPath: '/metaheader/'    
  },
};