/* eslint-env node */
var module;
function parseBoolean(str) {
  return str !== undefined && !!JSON.parse(str);
}

var isProduction = parseBoolean(process.env.PRODUCTION);
module.exports = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: "./js/app.js",
    testbed: "./js/testbedEntryPoint.js",
  },
  // performance: {
  //   hints: "warning",
  // },
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
  devtool: "cheap-module-eval-source-map",
  target: "web",
  output: {
    filename: "[name].bundle.js",
    library: "RS",
  },
};
