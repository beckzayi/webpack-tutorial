const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 设置node环境变量
process.env.NODE_ENV = 'development';

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build'),
    clean: true,
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
          // "style-loader", // ignore style-loader when using MiniCssExtractPlugin
          // mini-css-extract-plugin 取代了 style-loader. 作用: 提取js中的css成单独css文件
          MiniCssExtractPlugin.loader,
          // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
          'css-loader',

          /**
            * css 兼容性处理: 使用 postcss --> postcss-loader, postcss-preset-env
            * 帮postcss找到package.json中browserslist里面的配置, 通过配置加载指定的css兼容性样式
                "browserslist": {
                    // 开发环境 --> 设置node环境变量: process.env.NODE_ENV = development
                    // 设置了node环境变量为development后, 将使用开发环境
                    "development": [
                        "last 1 chrome version",
                        "last 1 firefox version",
                        "last 1 safari version"
                    ],
                    // 生产环境: 默认是看生产环境
                    "production": [
                        ">0.2%",
                        "not dead",
                        "not op_mini all"
                    ]
                }
            * 
          */
          // postcss-loader
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['postcss-preset-env']],
              },
            },
          },
        ],
      },
      {
        // 处理sass资源
        test: /\.s[ac]ss$/,
        // npm i sass-loader sass -D
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash:10].[ext]',
          // 关闭es6模块化
          esModule: false,
          // 在输出目录下的路径
          outputPath: 'img',
        },
      },
      {
        // 处理html中image资源
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        // 处理其它资源
        exclude: /\.(html|js|css|less|sass|scss|jpg|png|gif)/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath: 'asset',
        },
      },

      /**
       * 语法检查: eslint-loader eslint
       * 注意:只检查自己写的代码, 第三方库无需检查
       * 设置检查规则: package.json 中 eslintConfig 设置 airbnb
       * eslint-config-airbnb-base: 需要 eslint, eslint-plugin-import
       */
      //   {
      //     test: /\.js$/,
      //     exclude: /node_modules/, // 不检查第三方的库
      //     loader: "eslint-loader",
      //     options: {
      //       // 自动修复 eslint 的错误
      //       fix: true,
      //     },
      //   },
    ],
  },
  plugins: [
    // 功能: 默认会创建一个空的HTML, 自动引入打包输出的所有资源 (JS/CSS)
    // 需求: 需要有结构的HTML文件
    new HtmlWebpackPlugin({
      // 复制该index.html文件, 并自动引入打包输出所有资源 (JS/CSS)
      template: resolve(__dirname, 'src', 'index.html'),
    }),
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: 'css/built.css',
    }),
  ],
  mode: 'development',

  // 开发服务器devServer: 用来自动化 (自动编译刷新, 自动打开浏览器)
  // 特点: 不会有任何输出, 只会在内存中编译打包
  // 启动devServer指令为: npx webpack serve --open
  devServer: {
    // 项目构建后路径
    contentBase: resolve(__dirname, 'build'),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3004,
    // 自动打开默认的浏览器
    open: true,
  },

  optimization: {
    minimizer: [
      // This will enable CSS optimization only in production mode.
      new CssMinimizerPlugin(),
    ],
    // If want to compress CSS in development env, set the optimization.minimize option to true
    // minimize: true,
  },
};
