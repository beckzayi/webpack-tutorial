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
