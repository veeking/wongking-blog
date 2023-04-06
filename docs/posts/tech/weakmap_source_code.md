---
date: 2021-11-22
category:
  - 技术
tag:
  - 前端
  - WeakMap
---

# 关于WeakMap为什么能实现弱引用问题的探讨

## 基本概述
[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) 对象是一组键/值对的集合，属于弱引用关系。其键必须是对象，而值可以是任意的。

**什么是弱引用：**`没有额外开新对象保存键值引用，只是保存原对象的引用，取值也只是从原对象里取值。如果原对象删除，那么引用也会被删除。`

![图 1](/assets/posts/844118eb2c9f833723000c1c1f592800b0e65985caa40329078d265a7e63470f.png)  

## 简单用法：

```javascript
function dep () {
  console.log('source dep')
}
let source = { name: 'foo' }

let deps = new WeakMap()
// 设置
deps.set(source, dep)
// 获取
const sourceDep = deps.get(source)
sourceDep() // output 'source dep'
```

## 内存泄露问题
说到原理之前，先看看常规`Map`下可能会导致的内存泄露问题。
```javascript
// 创建一个 Map 存储关联数据
const dataMap = new Map();

function createNodeWithData() {
  const node = document.createElement('div');

  // 为 DOM 节点关联一些数据
  const data = {
    id: Math.random().toString(36).substr(2, 9),
    description: 'This is some associated data.',
  };

  dataMap.set(node, data);
  return node;
}

function removeNode(node) {
  // 删除 DOM 节点
  node.remove();

  // 需要手动移除关联数据，否则就会内存泄露
  // dataMap.delete(node);
}

// 创建 DOM 节点并关联数据
const node = createNodeWithData();

// 删除 DOM 节点
removeNode(node);
```
通过上述代码看出，如果 `removeNode` 函数里不执行`dataMap.delete(node)`的话， `dataMap` 对 `node` 的引用仍然存在在内存中，需要在删除 DOM 节点时，同时从 `dataMap` 中删除关联数据，否则就会导致内存泄漏。 
而如果换成`WeakMap`，因其键对象是弱引用的关系，当`node`节点被删除后且不再被除了`WeakMap`本身外的代码引用时，GC垃圾回收器会自动删除这个对象。减少手动出错率，提高代码可维护和健壮性。 

## 实现原理：

从上述内容来看，`WeakMap`会将对象变成弱引用，**从而可以让垃圾回收机制能够在回收周期自动回收处理 避免忘记手动清除引用导致内存溢出问题。**

简单来说就是，让菜鸡也能自动化管理内存回收，无需高深优化技巧。 

那么，浏览器内部是如何实现弱引用的呢？实际上，弱引用是 JavaScript 引擎（如 V8）在底层实现的，无法通过简单地在 JavaScript 代码中实现。但是可以通过一些`WeakMap polyfill`实现来大致了解下简单的原理。

**示例代码：**

```javascript
class SimpleWeakMap {
  constructor() {
    this.name = `__vm__${this._generateUUID()}`; // (__vm__uid这个新属性的目的是为了：1、唯一检索标识  2、区隔新老数据)
  }
  set(key, value) {
    Object.defineProperty(key, this.name, {
      value: [key, value],
      configurable: true // 添加 configurable: true，以便以后可以删除或更改属性
    });
    return this;
  }
  get(key) {
    const entry = key[this.name];
    return entry && entry[0] === key ? entry[1] : undefined;
  }
  _generateUUID() {
    return Math.random().toString(36).substr(2, 9);
  }
}


let foo = { name: '老王' };
const fooMap = new SimpleWeakMap();
fooMap.set(foo, 'bar');
console.log(fooMap.get(foo));
```
从代码中可以看出，首先通过`Object.defineProperty`给这个原对象`foo`加了一个新属性`this.name`也就是`__vm__<uuid>`，使原始对象变成`foo = { __vm__<uuid>: [foo, 'bar'] }`这种对象结构，并通过`foo[__vm__<uuid>]`来获取数据值，这种结构不会额外创建新的键值引用关系。

所以，总结概括下原理就是，**在原始对象上以新增属性的方式来存储新数据，是在原有的引用关系基础上创建的，而不是创建新的引用关系，所以，当原始对象删除后，相关的引用对象不再被引用，GC垃圾回收器就会自动将没有引用的对象内存回收。**

## 应用场景：
1. **为对象关联元数据**，为对象附加额外的信息（例如计数器、状态等）时，可以使用 WeakMap 将元数据与对象关联，而无需修改对象本身。比如引用别的对象的主对象，给DOM元素添加辅助对象值。
  ```
  // set
 weakMap.set(element,  { x: 0, y: 0 })
 // get
 console.log(weakMap.get(element))
  ```
  
2. **缓存数据** ，WeakMap会自动处理键对象的GC自动回收占用的内存数据(回收内存不等于清除变量数据)，不需要手动管理缓存的生命周期。简化了缓存管理，减少了错误的可能性。

3. **响应式编程**，通过跟踪对象属性的变化，在对象数据上设置依赖函数，使得数据变化时，相关的更新依赖函数能够自动触发。

  
## 相关参考
1. [WeakMap的使用实例以及内存展示](https://www.jb51.net/article/145111.htm)
2. [JS WeakMap应该什么时候使用 - 张鑫旭](https://www.zhangxinxu.com/wordpress/2021/08/js-weakmap-es6/)
3. [ES6之WeakMap](https://www.jianshu.com/p/8c4ffa77b346)