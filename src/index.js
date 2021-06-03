/**
 * 1. 运行指令:
 *      开发环境: npx webpack ./src/index.js -o ./build --mode=development
 *      生产环境: npx webpack ./src/index.js -o ./build --mode=production
 */

import "./css/style.css";

function add(a, b) {
  return a + b;
}

console.log(add(1, 2));
