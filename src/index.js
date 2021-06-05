/**
 * 1. 运行指令:
 *      开发环境: npx webpack ./src/index.js -o ./build --mode=development
 *      生产环境: npx webpack ./src/index.js -o ./build --mode=production
 */

import '@babel/polyfill';
import './css/style.css';
import './css/app.scss';

const add = (a, b) => {
  return a + b;
};

// eslint-disable-next-line
console.log(add(1, 2));

function subtract(x, y) {
  return x - y;
}

const promise = new Promise();
