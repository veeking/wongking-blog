---
date: 2021-08-17
category:
  - 技术
tag:
  - 前端
  - web动画
---

# web落地动效播放方案小结

日常工作中，涉及强调动效的业务，都需要与设计师讨论实现方案，并由其来设计输出约定格式的动效文件，前端只负责将文件丢到播放器里进行播放即可。下面总结几个业务中常用到的web动效播放方案并列出更优的解决方案。

![图 1](/assets/posts/eb0529fdd423296824191d621d8bb14448ff22178d7c553350e559a2ff109238.png)  


## `lottie`动画
- 地址：https://github.com/airbnb/lottie-web
- 适用场景：常规小型的纯展示类动效
- 优点：
	 - 设计借助AE插件bodymovin插件方便导出
	 - 开发只需要导入文件和素材即可直接播放
	 - 跨平台
- 缺点：
	 - lottie-web渲染都是基于2d渲染，性能不佳
	 - 动画过程中无法实时动态更换素材或内容

## `svga`动画
- 地址：https://github.com/svga/SVGAPlayer-Web
- 适用场景：代替lottie使用，常规小型且可以动态更换内容的互动动效
- 优点：
   - 支持动画运行过程中实时动态更换素材或内容
   - 设计借助AE插件(http://svga.io/designer.html)直接导出
   - 开发只需要导入文件和素材即可直接播放
   - 跨平台 
- 缺点：
	 - svga目前暂没有引入webgl来使用GPU渲染还是常规的CPU 2d渲染，性能不佳

## `apng`动画
- 地址：聊聊APNG https://juejin.cn/post/6950650715408695310
- 适用场景：只适用于循环播放的小展示类动效，比如小粒子。因为存在兼容问题，且要精确控制播放流程的话需要借助:https://github.com/davidmz/apng-canvas
- 优点：
   - 同尺寸大小下，要比gif图片的清晰度更高
   - 设计人员借助AE直接导出APNG图
   - 无需引入第三方库 最小化动效实现
   - 跨平台
- 缺点：
   - 文件对于web来说还是偏大
   - 存在兼容问题

## `gif`动画
- 优点：
   - 设计人员直接导出
   - 兼容性最好
   - 无需引入第三方库 最小化动效实现
   - 跨平台
- 缺点：
   - 尺寸大
   - 清晰度不高
   - 无法透明
## `WebGL渲染透明的Video`
- 地址：https://github.com/Tencent/vap
- 适用场景：简单的粒子展示类动效
- 优点：
  - 设计人员导出视频
  - WebGL GPU加速 性能好
  - 能方便暂停、加速、续播等操作
  - 无需引入第三方库 最小化动效实现
- 缺点：
  - 底层借助video播放，所以会存在不同终端兼容问题(比如首次播放被禁止，播放时被强制全屏等等)
  - 播放多个实例会因为video高消耗内存导致性能严重下降，所以同时只能允许一个实例播放
  - 设计人员导出视频得按照有遮罩的格式来导出

## `Sprites Animation`雪碧图序列帧
- 适用场景：简单的互动或展示类动效
- 优点：
  - 设计人员动效导出方便
  - css Sprite能很方便直接借助animation来快速播放
  - 能根据不同状态来控制切换不同的帧数
  - 无需引入第三方库 最小化动效实现
- 缺点：
  - 文件体积大
  - css Sprite通过animation来播放会严重消耗显存资源，造成部分机型渲染闪烁的问题（解决：通过canvas来播放(优先推荐webgl渲染的canvas))
     
在线拼接生成雪碧图：https://www.toptal.com/developers/css/sprite-generator/


## `css3 animation/transform`动画
- 适用场景：适用存在简单的旋转、缩放、位移、透明度的动画
 - 优点：
 - 浏览器动态控制渲染，且能开启GPU渲染，性能较好
- 无需引入第三方库 最小化动效实现
  - 兼容性好
- 缺点：
  - 暂时没有强大的可视化编辑生成工具导致设计人员无法参与动画制作
  - 开发手动调整开发，耗费时间较大，且效果不一定好.
  - 纯展示时候方便，如果涉及交互互动，要处理监听动画结束和动态修改动画数据的逻辑 


## 总结
由以上得出，最佳的动画组合方案是:
```
动效编辑器(操作和界面可以参考AE)
   +
WebGl渲染(支持优雅降级到2d)的canvas动效播放器 + css动画
```

- `动效编辑器`中既可以编辑常规动效，也可以编辑粒子动效
- 导出动效时导出`素材 + json(描述数据)`或将其`打包成zip格式`，常规模式全部通过`canvas动效播放器`播放。但也可以设置单独导出`css动画`，允许快速直接web开发使用.
- 可以设置成常用`模板`，方便二次修改快速生成


## 参考
- [阿里mars动画编辑器](https://render.alipay.com/p/s/mars-editor)