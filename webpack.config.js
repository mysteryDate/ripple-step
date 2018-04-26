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
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "eslint-loader",
      },
    ],
  },
  devtool: "cheap-module-eval-source-map",
  target: "web",
  output: {
    filename: "build/[name].bundle.js",
    library: "RS",
  },
};
