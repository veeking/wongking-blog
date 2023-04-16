---
date: 2022-09-17
category:
  - 技术
tag:
  - 前端
  - 单元测试
  - jest 
---


# Jest单元测试简要指南

![图 1](/assets/posts/368528e8d3aa63af52975ba55be6e8f092bd42fa43f428449a0bbab5ccf9a0f4.png)  

## 1、为什么要测？

避免编码过程中出现逻辑错漏的BUG，提高单元模块的健壮性。

## 2、选择什么测试框架？
主流的单元测试框架主要有： [Jasmine](https://jasmine.github.io/)、[Mocha](https://mochajs.org/)、[Jest](https://jestjs.io/)、[ava](https://github.com/avajs/ava)、[Vitest](https://vitest.dev/)
其中，`Jest`配置搭建最简单快速，适合在短时间内快速部署单元测试用例。所以，我们也优先选择`Jest`来作为单元测试的首选框架。而`Vitest`是基于`Vite`的新兴高性能测试框架，自带GUI可视化页面，也比较推荐。

在语法方面，`Jest`使用的是[Expect](https://jestjs.io/zh-Hans/docs/expect)断言语法。

```javascript
expect(1).toEqual(1)
```

## 3、如何配置使用？

首先安装基础必备npm包：
- `jest`
- `jest-environment-jsdom`
- `jsdom`
- `ts-jest`
- `@types/jest`

然后在根目录创建`jest.config.js`配置文件

```javascript
module.exports = {
  preset: 'ts-jest', //  支持 TypeScript 的预处理器
  testEnvironment: 'jsdom', // 测试环境 默认node，jsdom为web环境
  roots: [
    "<rootDir>/test"
  ],
  testRegex: [ 
    "/test/.*\\.(test|spec)\\.(jsx?|js?|mjs?|tsx?|ts?)$"
  ],
  transform: { // 测试代码转码（转成常规js）处理规则和处理器配置
    "^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: [ 
    "<rootDir>/examples/",
    "<rootDir>/lib/",
    "<rootDir>/node_modules/",
    "<rootDir>/scripts/"
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'mjs',
    'ts',
    'tsx',
    'json'
  ]
}
```
最后，添加script字段脚本命令并运行
```ts
// coverage 表示显示测试用例覆盖率，可以配合--collectCoverageFrom=src/**/!\\(*.d.ts\\)来自定义规则覆盖检查具体文件类型
"test": "jest --no-cache --coverage"
// 运行即可
npm run test
```
## 4、测什么？
（模拟）执行不同条件下的(返回)值、调用状态的输出与预期输入是否相符。
## 5、怎么测？
既然是单元测试，那么就先要将业务拆分成多个单元模块进行逐个测试，拆分方法可以是按组件拆分，也可以是按功能模块拆分，具体细粒度划分自行根据项目逻辑结构来决定。

同时，单元测试本身的重点难点在于如何对一个拆分独立的功能模块进行逻辑和数据的模拟，所以利用框架自身的特性去高效、精准模拟场景数据和逻辑也是关键一环。
**以下是常见测试场景及案例**
- 通用预期值匹配
```ts
// 通用预期匹配
expect(value).toBe()
expect(value).toEqual()
// undefined, null, and false相关的预期匹配
expect(value).toBeNull() 
expect(value).toBeDefined()
expect(value).not.toBeUndefined()
expect(value).not.toBeTruthy()
expect(value).toBeFalsy()
// number相关的预期匹配
expect(value).toBeGreaterThan(n) // 大于
expect(value).toBeGreaterThanOrEqual(n) // 大于等于
expect(value).toBeLessThan(n)
expect(value).toBeLessThanOrEqual(n)
// 对象属性的预期匹配
expect(value).toHaveProperty('property') // 是否存在特定属性
expect(value).toMatchObject(object) // 一个对象是否匹配另一个对象
// 方法的预期值匹配(func必须为jest.fn模拟的方法)
expect(func).toHaveBeenCalled() // 是否调用
expect(func).toHaveBeenCalledWith('a') // 是否通过指定参数调用
expect(func).toHaveBeenCalledTimes(1) // 检查调用次数
expect(func).toHaveReturned() // 是否有返回
```

- 异步预期值匹配
```ts
// a.ts
function fetchData () {
  return new Promise(resolve => {
    setTimeout(() => {  
      resolve('data')
    }, 1500) 
  })
}
// a.test.ts 
// 异步获取resolve值
test('fetchData should be resolves', async () => {
  await expect(fetchData()).resolves.toEqual('data') 
})
// 异步抛出reject错误
test('fetchData should be rejects', async () => {
  await expect(Promise.reject(new Error('data')).rejects.toThrow('data')
})
```
- 模拟定时器
```ts
// a.ts
function fetchData () {
  return new Promise(resolve => {
    setTimeout(() => {  
      resolve('fakeTime')
    }, 3000) 
  })
}
// a.test.ts 
// 测试时我们不可能真的去等3000毫秒时间，所以我们需要使用jest的fakeTimer来模拟时间
jest.useFakeTimers()
const getData = fetchData()
// 注意：runAllTimers 必须放在异步后才生效
// 三种方法让定时器快速结束:
// 1、jest.advanceTimersByTime(5000) - 向前推进多少毫秒
// 2、jest.runOnlyPendingTimers() - 结束运行timer宏任务等待队列里的定时器
// 3、jest.runAllTimers() - 立即结束所有定时器
jest.runAllTimers()
await expect(getData).resolves.toEqual('fakeTime')
// 使用后必须恢复成真实的定时器，否则影响全局
jest.useRealTimers()
```
- 模拟日期
```ts
// a.ts 中有日期时间相关判定逻辑
const currentTime = Date.now()
const endTime = new Date('2077-09-16').getTime()
// 结束判定分支
if (currentTime >= endTime) {
 console.log('结束了')
}
// 假如我们想测试结束后的分支逻辑，需要将Date日期进行模拟修改
// a.test.ts 
// 方法1：spyOn方式
const fakeCurrentTime = new Date('2080-09-20').getTime()
const currentTimeSpy = jest.spyOn(global.Date, 'now').mockImplementation(() => fakeCurrentTime)
console.log(Date.now)
// 恢复方法
currentTimeSpy.mockRestore()
// 方法2：setSystemTime (Jest >= 26版本支持)
jest.useFakeTimers().setSystemTime(new Date('2080-09-20').getTime()) 
// 恢复方法
jest.useRealTimers()
```
  - 模拟全局属性
```ts
// 示例：模拟全局ua值
// 方法1：使用spyOn来模拟全局ua值
const userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('自定义的ua')
console.log(window.navigator.userAgent) // output: '自定义的ua'
// 恢复全局ua值
userAgentSpy.mockRestore()
// or
// 方法2： Object.defineProperty重新设置window.navigator为可写入。会影响全局 难以恢复 慎用
// Object.defineProperty(window.navigator, 'userAgent', {
//   writable: true,
//   value: userAgent
// })
```
  - 模拟`export/import`的模块
```ts
// a.ts
export function foo() {
  const bar = 1
  return bar
}

// 方法1：jest.mock在文件顶部设置全局
// a.test.ts
import { foo } from 'a.ts'
jest.mock('./a.ts', () => {
  // jest.requireActual获得原始模块引用
  const { foo: originalFoo } = jest.requireActual('./a.ts')
  return {
    foo: jest.fn(() => {
      const bar = 2
      const originalReturnValue = originalFoo()
      return bar + originalReturnValue
    })
  }
})
it('module [a] should be return the mocked value with plus original return value', () => {
  // 2(mock) + 1(original) = 3
  expect(foo()).toBe(3)
})

// 方法2：jest.doMock在单个测试模块里使用
it('module [a] should be return the mocked value with plus original return value', async () => {
  jest.doMock('./a.ts', () => {
    const { foo: originalFoo } = jest.requireActual('./a.ts')
    return {
      foo: jest.fn(() => {
        const bar = 2
        const originalReturnValue = originalFoo()
        return bar + originalReturnValue
      })
    }
  })
  // doMock执行后需要重新import动态重新引入才能生效
  const { foo } = await import('./a.ts')
  expect(foo()).toBe(3)
})
```
