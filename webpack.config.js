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
  target: "web",
  output: {
    filename: "bundle.js",
  },
};
