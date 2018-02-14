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
  devtool: "source-map",
  debug: true,
  target: "web",
  output: {
    filename: "bundle.js",
  },
};
