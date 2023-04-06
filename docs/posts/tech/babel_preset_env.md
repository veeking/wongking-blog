---
date: 2021-08-12
category:
  - 技术
tag:
  - 前端
  - babel
---

# @babel/preset-env和@babel/plugin-transform-runtime的区别和作用

## @babel/preset-env的配置

**作用：** 
1. 提供syntax语法转换和特性API的polyfill的核心能力

`entry`模式只根据`browserslist`来将所有对应不兼容的特性全部注入。

该模式下需要在入口文件顶部引入以下模块：
 ```javascript
 // babel 6.x版本
 import "@babel/polyfill"
 // babel >= 7.x版本
 import "core-js/stable"
 import "regenerator-runtime/runtime"
 ```
缺点是会注入很多项目不需要的特性polyfill代码，使文件变得臃肿。

`usage`模式先从`browserslist`里生成相关特性，再根据代码中的syntax和API特性按需注入对应特性，实现了代码最小化目标。
 - 该模式下需要指定corejs版本，目前最新版本是3.x，即`corejs: 3` (babel  >= 7.4版本已经遗弃@babel/polyfill，改为core-js作为垫片，目前`core-js`最新版本是`3.x`，2.x版本已经冻结不推荐使用)

无论是`entry`还是`usage`都需要安装`core-js`模块，否则编译过程如果找不到core-js模块的话，就会直接在文件顶部以
```
require('core-js/modules/es.regexp.exec.js')
```
的形式注入（这样会导致如果依赖的项目也没有core-js或者是umd浏览器使用，那么require将无法识别），而不是直接注入对应特性代码。


##  @babel/plugin-transform-runtime的配置
**作用：**
1. 将preset-env生成的重复helper方法抽离统一复用
2.  对polyfill进行沙箱隔离避免变量全局污染
```javascript
['@babel/plugin-transform-runtime', {
  corejs: '3.xx'  
}]
// 输出
_interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"))
```
插件的corejs选项有3个：
1. `false`默认情况下，如果preset-env没有指定corejs版本的化，也可以在此处指定，否则使用的就是默认的stable版本，仅支持帮助函数的沙箱化。
2.  `2`: 除了帮助函数，还支持全局变量（例如 Promise）和静态属性（例如 Array.from）沙箱化
3.  `3`: 除了上述的，还支持实例属性（例如 [].includes，[].findIndex）沙箱化


**总结：**
`@babel/preset-env`和`@babel/plugin-transform-runtime`在配置了`corejs`(只要配置一处即可)都可以针对代码生成polyfill垫片，但是`plugin-transform-runtime`不会转换基本语法，所以需要配合`preset-env`使用。  
但是单纯地`preset-env` 会生成很多多余重复的helper（比如代码中多个地方用了promise，那么就会生成多个promise垫片），造成代码臃肿，所以这时候需要`plugin-transform-runtime`配合来复用沙箱化，实现最佳最小化编译。


## 相关参考
1. [手摸手带你搞明白preset-env和plugin-transform-runtime的组合方式]([https://](https://juejin.cn/post/7011133102034518023))

2. [前端工程化：你所需要知道的最新的babel兼容性实现方案](https://baijiahao.baidu.com/s?id=1709714903451987794&wfr=spider&for=pc)