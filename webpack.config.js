var module;
module.exports = {
  entry: "./app.js",
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
    filename: "bundle.js",
  },
};
