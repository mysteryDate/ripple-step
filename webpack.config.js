var module;
module.exports = {
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
