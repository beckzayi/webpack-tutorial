const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "js/built.js",
    path: resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        // 处理css资源, 匹配哪些文件
        test: /\.css$/,
        // 使用哪些loader进行处理
        // npm i css-loader style-loader -D
        use: [
          // use 数组中的loader执行顺序: 从右到左，从下到上依次执行
          // 创建style标签，将js中的样式资源插入进行，添加到head中生效
          "style-loader",
          // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
          "css-loader",
        ],
      },
      {
        // 处理sass资源
        test: /\.s[ac]ss$/,
        // npm i sass-loader sass -D
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        loader: "url-loader",
        options: {
          limit: 8 * 1024,
          name: "[hash:10].[ext]",
          // 关闭es6模块化
          esModule: false,
          // 在输出目录下的路径
          outputPath: "img",
        },
      },
      {
        // 处理html中image资源
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        // 处理其它资源
        exclude: /\.(html|js|css|less|sass|scss|jpg|png|gif)/,
        loader: "file-loader",
        options: {
          name: "[hash:10].[ext]",
          outputPath: "asset",
        },
      },
    ],
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

  // 开发服务器devServer: 用来自动化 (自动编译刷新, 自动打开浏览器)
  // 特点: 不会有任何输出, 只会在内存中编译打包
  // 启动devServer指令为: npx webpack serve --open
  devServer: {
    // 项目构建后路径
    contentBase: resolve(__dirname, "build"),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3004,
    // 自动打开默认的浏览器
    open: true,
  },
};
