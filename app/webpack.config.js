const path = require("path");
//const CopyWebpackPlugin = require("copy-webpack-plugin");

// td:
// had webpack in global node_module because of trouble with truffle
// don't forget:  export NODE_PATH=/usr/local/lib/node_modules
// NODE_PATH must be set to load modules from "global"-modules-dir.
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  //td see: https://webpack.js.org/configuration/resolve/
  // Webpack 5 no longer polyfills Node.js core modules automatically which means 
  // if you use them in your code running in browsers or alike, you will have to 
  // install compatible modules from npm and include them yourself...
  /*
  resolve: {
    fallback: {
      events: require.resolve('events'),  // use polyfill, install events
      //events: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url'),
      os: require.resolve('os-browserify/browser'),
    },
  },
  */
  plugins: [
    
    //new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html" }]),
    new CopyPlugin([{from: "./src/index.html", to: "index.html"}]),
    //td: new version with no API: (2022-07)
    //td: we switch back to old webpack 4.46.0 see above
    /*
    new CopyPlugin({
      patterns: [
        {from:"./src/index.html", to:"index.html"}
      ]
    }),
    */
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
