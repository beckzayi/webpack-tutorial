/**
 * 1. 运行指令:
 *      开发环境: npx webpack ./src/index.js -o ./build --mode=development
 *      生产环境: npx webpack ./src/index.js -o ./build --mode=production
 */

import './css/style.css';
import './css/app.scss';
import printMe from './print';

const add = (a, b) => {
  return a + b;
};

// eslint-disable-next-line
console.log(add(1, 2));

function subtract(x, y) {
  return x - y;
}

if (module.hot) {
  module.hot.accept('./print.js', function () {
    console.log('Accepting the updated printMe module!');
    printMe();
  });
}

/**
 * Code split
 * 通过js代码, 让某个文件被单独打包成一个chunk
 * import动态导入语法: 能将某个文件单独打包
 */
// import(/* webpackChunkName: 'print' */ './print')
//   .then(({ multiply }) => {
//     // 文件加载成功
//     // eslint-disable-next-line
//     console.log('multiply', multiply(4, 3));
//   })
//   .catch(() => {
//     // eslint-disable-next-line
//     console.log('文件加载失败');
//   });

/**
 * 懒加载 lazy loading: 当文件需要时才加载
 * 预加载 prefetch: 会在使用之前 提前加载js文件, 等其它资源加载完毕, 浏览器空闲了, 再偷偷加载资源
 * 正常加载可以认为是并行加载 (同一时间加载多个文件)
 */
document.getElementById('btn').onclick = function () {
  import('./print').then(({ multiply }) => {
    console.log(multiply(4, 5));
  });
};

/**
 * 1. eslint 不认识 windows, navigator 全家变量
 *    解决: 改package.json中eslintconfig
 *    "env": {
 *      "browser": true
 *    }
 * 2. 关于验证, service worker 代码必须运行在服务器
 *    1) nodejs 中写
 *    2) npm i server -g, serve -s build 启动服务器, 将build目录下所有资源作为静态自己包里出去
 */
// 注册serviceWorker
// 处理兼容性问题
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(() => console.log('Service Worker 注册成功'))
      .catch(() => console.log('Service Worker 注册失败'));
  });
}
