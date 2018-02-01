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
  output: {
    filename: "bundle.js",
  },
};
