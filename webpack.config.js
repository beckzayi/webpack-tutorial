const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "built.js",
    path: resolve(__dirname, "build"),
  },
  plugins: [
    // 功能: 默认会创建一个空的HTML, 自动引入打包输出的所有资源 (JS/CSS)
    // 需求: 需要有结构的HTML文件
    new HtmlWebpackPlugin({
      // 复制该index.html文件, 并自动引入打包输出所有资源 (JS/CSS)
      template: resolve(__dirname, "src", "index.html"),
    }),
  ],
  mode: "development",
};
