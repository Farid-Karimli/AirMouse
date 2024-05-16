const rules = require("./webpack.rules");
const path = require("path");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  target: "electron-renderer",
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
};
