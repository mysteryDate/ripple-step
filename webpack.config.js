/* eslint-env node */
var module;
function parseBoolean(str) {
  return str !== undefined && !!JSON.parse(str);
}

var isProduction = parseBoolean(process.env.PRODUCTION);
module.exports = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: "./js/mainEntryPoint.js",
    testbed: "./js/testbedEntryPoint.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "eslint-loader",
      },
    ],
  },
  stats: {maxModules: Infinity, exclude: undefined},
  devServer: {
    host: '0.0.0.0',//your ip address
    port: 8080,
  },
  devtool: "cheap-module-eval-source-map",
  target: "web",
  output: {
    filename: "[name].bundle.js",
    library: "RS",
  },
};
