var module;
module.exports = {
  entry: "./js/app.js",
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
    filename: "build/bundle.js",
  },
};
