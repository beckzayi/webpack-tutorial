const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

// 设置node环境变量
process.env.NODE_ENV = 'development';

// Make an array, and spread it
// const commonCssLoader = [
//   MiniCssExtractPlugin.loader,
//   'css-loader',
//   {
//     loader: 'postcss-loader',
//     options: {
//       postcssOptions: {
//         plugins: [['postcss-preset-env']],
//       },
//     },
//   },
// ];
// [...commonCssLoader]

/**
 * 缓存:
 *    babel缓存 (babel-loader)
 *        cacheDirectory: true
 *    文件资源缓存
 *        hash: 每次webpack构建时会生成一个唯一的hash值
 *            问题: 如果js和css同时使用一个hash值, 重新打包后, 会导致所有缓存失效 (只改动了一个文件)
 *        chunkhash: 根据chunk生成的hash值. 如果打包来源于同一个chunk, 那么hash值就一样
 *            问题: js和css的hash值还是一样的. 因为css是在js中被导入的, 所以同属于一个chunk
 *        contenthash: 根据文件的内容生成hash值. 不同文件hash值一定不一样
 */

/**
 * tree shaking: 去除无用代码
 *    前提: 1.必须使用ES6模块化. 2.开启production环境
 *    效果: export function add(x, y), 但在其它文件并没导入该 function add, 那么 tree shaking 将会去除这个 function add
 *
 * 有一种情况: 在package.json中配置 "sideEffects": false, 那么所有代码都没副作用 (都可进行tree-shaking)
 *            出现一个问题: 该设置false, 胡把 import css 和 @babel/polyfill (副作用) 等文件干掉
 *            解决方法: "sideEffects": ["*.css", *.scss""]
 */

module.exports = {
  // entry: ['./src/index.js', './src/index.html'],
  entry: './src/index.js', // 单入口
  // entry: {
  //   // 多入口
  //   index: './src/index.js',
  //   print: './src/print.js',
  // },
  output: {
    filename: 'js/built.[name].[contenthash:10].js',
    path: resolve(__dirname, 'build'),
    clean: true,
  },
  module: {
    rules: [
      /**
       * oneOf 只会匹配一个 loader. 使用 oneOf 时, 不能有2个loader配置去处理同一种类型文件
       * 若需使用2个loader, 那么需把一个loader单独放出来
       * 作用: 提高构建速度, 无需每一个loader配置都过一遍
       */
      // {
      //   oneOf: [...rules]
      // }
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
                        ">0.2%", // >0.2% market share
                        "not dead", // ignoring browsers without security updates like IE 10 and Blackberry
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
      //     enforce: 'pre', // 优先执行该loader 如果这个文件类型需要被多个loader处理
      //     loader: "eslint-loader",
      //     options: {
      //       // 自动修复 eslint 的错误
      //       fix: true,
      //     },
      //   },

      /**
       * Compatible JS: babel-loader @babel/core @babel/preset-env
       * 1. 基本js兼容性处理 --> @babel/preset-env
       * 2. 全部js兼容性处理 --> @babel/polyfill, 例如Promise
       *    问题是: 若只想解决部分兼容性问题, 但将所有兼容性js代码全部引入, 体积太大.
       * 3. 兼容性处理: 按需加载 --> core-js
       */
      /**
       * 正常来说, 一种文件只能被一个loader处理。当要被多个loader处理时, 那么要指定loader执行的先后顺序.
       * 先执行eslint 再执行babel 较合理和合适
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 预设: 指示babel做哪种兼容性处理
          presets: [
            [
              '@babel/preset-env',
              {
                // 按需加载
                useBuiltIns: 'usage',
                // 指定core-js版本
                corejs: {
                  version: 3,
                },
                // 指定兼容性做到哪个版本浏览器
                targets: {
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17',
                },
              },
            ],
          ],
          // 开启babel缓存
          // 第二次构建时, 会读取之前的缓存
          cacheDirectory: true,
        },
      },
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
      filename: 'css/built.[contenthash:10].css',
    }),
    /**
     * PWA 渐进式往来开发程序 (离线可访问)
     * 1. 帮助service worker快速启动
     * 2. 删除旧的service worker
     * 生成一个 service-worker 配置文件
     */
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  // 生产环境下会自动压缩
  mode: 'production',

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
    // 开启 Hot Module Replacement 功能
    /**
     * Hot Module Replacement 热模块替换
     * 作用: 一个模块发生变化, 只会重新打包这一个模块 (而不是打包所有模块)，将提升构建速度
     * 样式文件: 可以使用HMR功能, 因为style-loader内部实现了
     * js文件: 默认不能使用HMR功能
     *    解决: 用 module.hot 去检查, 若开启了HMR, 那么则有 module.hot, 然后指定那个js模块文件
     *    注意: HMR功能对js的处理, 只能处理非入口js文件的其它js文件.
     * html文件: 默认不能使用HMR功能, 同时会导致问题: html文件不能热更新 (一般情况下不用做HMR功能)
     *    解决: 修改entry入口, 将html文件引入
     * 无法对入口文件作HMR, 因为它引入了其它模块文件, 一旦入口文件有变化, 其它文件将被重新加载
     * 因此HMR只能应用于引入依赖的模块文件
     */
    hot: true,
  },

  /**
   * source-map: 一种提供源代码到构建后代码映射的技术 (如果构建后代码出了错, 通过映射可追踪到源代码出错)
   * 例如, 有个错误来自于 print.js, 浏览器console会显示该错误来自于print.js
   * 如果没有source-map, 则只会在 built.js 中提到错误, 不会提示来自于 print.js
   * 开发环境: 速度快 (eval>inline>cheap), 调试友好 - eval-source-map (React脚手架用了这个), eval-cheap-module-source-map
   * 生产环境: 源代码要不要隐藏 (nosources-source-map)? 调试要不要友好 (source-map)?
   *          inline-source-map 会让文件较大
   * 最后的选择: 开发环境用 eval-source-map, 生产环境用 source-map
   */
  devtool: 'source-map',

  optimization: {
    minimizer: [
      // This will enable CSS optimization only in production mode.
      new CssMinimizerPlugin(),
    ],
    // If want to compress CSS in development env, set the optimization.minimize option to true
    // minimize: true,

    /**
     * Code split
     * 1. 可以将node_modules中代码单独打包一个chunk最终输出
     * 2. 自动分析多入库chunk中, 有没有公共的文件. 如果有, 那么会自动打包成单独一个旅长
     */
    splitChunks: {
      chunks: 'all',
    },
  },

  target: 'web', // only for development

  externals: {
    // 拒绝jQuery被打包进来 (当jQuery由cdn引入时)
    jquery: 'jQuery',
  },
};
