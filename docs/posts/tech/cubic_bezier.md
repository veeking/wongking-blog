---
date: 2022-10-02
category:
  - 技术
tag:
  - 前端
  - 动画
  - 三次贝塞尔 
order: 1
sticky: true
star: true
---

# 聊聊Web中的三次贝塞尔曲线动画

## 什么是贝塞尔曲线？

`贝塞尔曲线(Bezier Curve)`是一种在`计算机图形学、工程设计和动画制作`中广泛应用的参数曲线。贝塞尔曲线以控制点的位置来描述曲线的形状，通过调整控制点的位置，实现对曲线形状的控制。最早由法国工程师`皮埃尔·贝塞尔（Pierre Bezier）`于`1962年`提出，主要用于平滑的汽车车身设计。

![图 5](/assets/posts/e481ed946562299b392fd051b39a7c0a80ef7a95fe8aca2a55c363c5f8234da5.jpg)  


## 什么是三次贝塞尔曲线？

在了解`三次(三阶)贝塞尔曲线`概念之前，我们首先需要了解`一次(阶)塞尔曲线`的基本定理。
`一次贝塞尔曲线`是只由两个控制点组成，即`P0`和`P1`，实际上就是一条直线，可以通过`线性插值（插入新的点值）lerp`公式表示：
$$ B(t) = (1-t)P0 + tP1 $$
其中，`t`是一个介于`0和1`之间的参数，当`t`从`0到1`不断变化时，$(1-t)P_0$ 使得点 $P_0$ 的权重逐渐减小，趋向0。而 $tP_1$ 使得点 $P_1$ 的权重逐渐增加，趋向1。这样，$B(t)$ 点会沿着 $P_0$ 到 $P_1$ 之间的直线移动，从而形成一条连接 $P_0$ 和 $P_1$ 的线段。

![图 42](/assets/posts/0396af62953e17b32eea0c43a4d4f3aaeaef28f39521702fde035acd5645f992.gif)  


现在，我们要**根据一次贝塞尔曲线公式推导出三次贝塞尔曲线公式**。对于`三次贝塞尔曲线`，我们有`四个控制点`：`P0`、`P1`、`P2` 和 `P3`。我们可以分解为以下步骤：
1. 在 `P0 和 P1` 之间进行线性插值，得到`点A`：$A = (1-t) * P0 + t * P1$
2. 在 `P1 和 P2` 之间进行线性插值，得到`点B`：$B = (1-t) * P1 + t * P2$
3. 在 `P2 和 P3` 之间进行线性插值，得到`点C`：$C = (1-t) * P2 + t * P3$

再将上述得到的点：

1. 在`点A`和`点B `之间进行线性插值，得到`点D`：$D = (1-t) * A + t * B$
2. 在`点B`和`点C `之间进行线性插值，得到`点E`：$E = (1-t) * B + t * C$

最后，在`点D` 和`点E` 之间进行`线性插值`，得到曲线上的`点B(t)`：
$$
B(t) = (1-t) * D + t * E
$$

![图 43](/assets/posts/83ad2b9b3c718960ed47b0b942c95b4f4a7dc3a8014a751bc2bbd8d97f3f1c76.jpg)  


接着将之前的点公式依次带入 `B(t)` ，得到如下公式：

$$
B(t) = (1-t)^3 * P_0 + 3 * (1-t)^2 * t * P_1 + 3 * (1-t) * t^2 * P_2 + t^3 * P_3
$$

再经过简单的整理后，就得到了标准的`三次(阶)贝塞尔曲线公式`：	

$$ B(t) = P_0(1-t)^3 + 3P_1t(1-t)^2 + 3P_2t^2(1-t) + P_3t^3 $$

公式经过方程整理后，会变成标准的`三次多项式`的格式，是一个关于参数 $t$ 的`三次多项式`方程，即

$$ f(t) = at^3 + bt^2 + ct + d $$

可以看得出来，`三次(三阶)贝塞尔曲线`中的`“三”`是指它是一个`三次多项式曲线`，即`多项式的最高次幂为3`，可以认为是从`P0`到`P3`有`三段连续的变化`，它们受到`关于 t 的不同次数加权项的影响`。此外，这条曲线是通过`多次线性插值（一次贝塞尔曲线）`的组合逐步生成的，并由`四个控制点（P0, P1, P2, P3）`来定义。我们会在下面的`缓动动画`章节进行详细说明`多项式方程的转换和求解`，**下面我们先来看看公式中具体的变量含义：**

![图 41](/assets/posts/c4ffa8e3189c3a48d870fae4e7294752424f5a0b227b8831f2885c1c362cf618.png)  


- `P`为相关的控制点坐标，`P0`和`P3`是起始和`结束点`，`P1`和`P2`是曲线形状的`控制点`。
- `t`为曲线参数值，也就是**曲线的进度值**，取值范围是`0 - 1`。`1-t`表示表示`当前点`与`曲线起点`和`终点`之间的相对距离，即随着`t`逐渐`变为1`时，`1-t`将逐渐`变为0`，`当前点`也由`起点`逐渐变为`终点`位置。
- `B(t)`为当前`t进度`下在`P0-P3区间`的曲线点坐标值。每个`P`点由`x`和`y`构成，在计算时需要分别计算两个方向的值`Bx(t)`和`By(t)`。  

现在，我们将上述公式转为`js`代码：
```javascript
B(t) = P0 * Math.pow((1 - t), 3) + 3 * P1 * t * Math.pow((1 - t), 2) + 3 * P2 * Math.pow(t, 2) * (1 - t) + P3 * Math.pow(t, 3)
```
最后，转为工具方法表示：
```javascript
function getCubicBezierPoint(t, p0, p1, p2, p3) {
  const t2 = Math.pow(t, 2)
  const t3 = Math.pow(t, 3)
  return (p0 * Math.pow((1 - t), 3)) +
    (3 * p1 * t * Math.pow((1 - t), 2)) +
    (3 * p2 * t2 * (1 - t)) +
    (p3 * t3)
}
```
::: normal-demo 曲线绘制演示(PC)
```css
.container {
  width: 600px;
  height: 400px;
  margin: 0 auto;
}
input[type="range"] {
  -webkit-appearance: none;
  width: 150px;
  height: 20px;
  background: transparent;
  transform: translateY(4px);
}


input[type="range"]::-webkit-slider-runnable-track {
  background-color: #ccc;
  height: 2px;
}

input[type="range"]::-moz-range-track {
  background-color: #ccc;
  height: 2px;
}


input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background-color: #f1c40f;
  cursor: pointer;
  border-radius: 50%;
  transform: translateY(-9px);
}
canvas {}
```
```html
<div class="container">
  <canvas id="bezierCanvas" width="600" height="370"></canvas>
  <div>
    <label for="stepSize">t进度步长大小: </label>
    <input type="range" id="stepSize" min="0.001" max="0.1" step="0.001" value="0.001">
    <!-- <input type="range" id="stepSize" min="1" max="100" value="1"> -->
    stepSize=<label id="stepSizeValue">0</label>
  </div>
</div> 
```
```js
function getCubicBezierPoint(t, p0, p1, p2, p3) {
  const t2 = Math.pow(t, 2)
  const t3 = Math.pow(t, 3)
  return (p0 * Math.pow((1 - t), 3)) +
    (3 * p1 * t * Math.pow((1 - t), 2)) +
    (3 * p2 * t2 * (1 - t)) +
    (p3 * t3)
}

const stepSizeInput = document.getElementById('stepSize');
const stepSizeValueEl = document.getElementById('stepSizeValue');

const canvas = document.getElementById('bezierCanvas');
const ctx = canvas.getContext('2d');

// 定义控制点
const p0 = {x: 100, y: 300};
const p1 = {x: 160, y: 120};
const p2 = {x: 540, y: 400};
const p3 = {x: 500, y: 30};

let stepSizeValue = parseFloat(stepSizeInput.value)
stepSizeValueEl.innerHTML = stepSizeValue

const drawCubicBezierCurve = (stepSize) => {
  console.log(canvas.width)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const step = stepSize;
  for (let t = 0; t <= 1; t += step) {
    const x = getCubicBezierPoint(t, p0.x, p1.x, p2.x, p3.x);
    const y = getCubicBezierPoint(t, p0.y, p1.y, p2.y, p3.y);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#f7c453';
    ctx.fill();
  }
}

stepSizeInput.addEventListener('input', (event) => {
  stepSizeValue = parseFloat(event.target.value);
  stepSizeValueEl.innerHTML = stepSizeValue
  drawCubicBezierCurve(stepSizeValue);
});

drawCubicBezierCurve(stepSizeValue);
```
:::


由上述得出，当`t进度值`在`0`到`1`之间变化时，曲线区间内的点值也会随之更新。

**当`t`的取值越精细，曲线值点就越多，数量越密，最终的曲线形状也越趋平滑。**

所以总结就是：

::: info &nbsp;
<p style="line-height: 30px;"><span style="background: #333;padding: 8px;">三次贝塞尔曲线</span>是由<span style="background: #333;padding: 8px;">四个控制点（P0, P1, P2, P3）</span>生成的曲线，它在<span style="background: #333;padding: 8px;">参数t</span>的范围(0到1之间)内变化。曲线上的每个点对应一个特定的坐标值，这些值由<span style="background: #333;padding: 8px;">贝塞尔曲线公式</span>根据<span style="background: #333;padding: 8px;">四个控制点</span>和<span style="background: #333;padding: 8px;">参数t</span>进行<span style="background: #333;padding: 8px;">加权计算</span>得出。<span style="background: #333;padding: 8px;">t值</span>的精确度决定了曲线形状的平滑程度。</p>
&nbsp;
:::



## 三次贝塞尔曲线与Web动画

`三次贝塞尔曲线`在Web动画领域有着广泛的应用，它不仅能创建复杂形状的`路径动画`，还能定义平滑过渡效果的[缓动函数动画](https://cubic-bezier.com/)。下面，我们将详细探讨**基于三次贝塞尔曲线**实现的`路径动画`和`缓动动画`。

### 路径动画
`路径动画`是一种沿着预先定义的路径移动图形元素的动画。通过使用`三次贝塞尔曲线`，我们可以先创建复杂且平滑的路径，然后让动画元素能够沿着这些路径进行移动。实现方式有`SVG`和`Canvas`两种方式。

#### SVG路径动画
`SVG`有两种方式可以实现路径运动，分别是`animateMotion`和`offset-path`，但是本质都是通过`<path>`元素中的`d`属性进行初始化路径绘制操作。下面是两种实现方式的代码示例：

::: normal-demo (点击展开代码) animateMotion实现
```html
<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- 跟随路径 -->
  <path id="motion-path" d="M50,150 C180,-100 350,350 450,30" fill="none" stroke="orange" />
  <!-- 移动小球 -->
  <circle cx="0" cy="0" r="10" fill="#EDE5C0">
    <animateMotion dur="5s" repeatCount="indefinite">
      <mpath xlink:href="#motion-path" />
    </animateMotion>
  </circle>
</svg>
```
:::

::: normal-demo (点击展开代码) offset-path实现(兼容不佳)
```css
 .motion-target {
   position: absolute;
   width: 20px;
   height: 20px;
   background-color: #EDE5C0;
   border-radius: 50%;
   -webkit-offset-path: path("M50,150 C180,-100 350,350 450,30");
   offset-path: path("M50,150 C180,-100 350,350 450,30");
   animation: motionMoving 5s linear infinite;
 }
 
 @keyframes motionMoving {
   100% { 
     offset-distance: 100%;
     -webkit-offset-distance: 100%;
   }
 }
```
```html
<!-- 移动小球 -->
<div class="motion-target"></div>
<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 跟随辅助参考路径 -->
  <path d="M50,150 C180,-100 350,350 450,30" fill="none" stroke="orange" />
</svg>
```
:::

在`SVG`路径命令中，`M`表示起始点，`C`按顺序则分别表示控制点1、控制点2和结束点。路径数据`d="M50,150 C180,-100 350,350 450,30"`的解释：

1. `M50,150`：将画笔移动到点 `(50, 150)`，作为曲线的起始点。
2. `C180,-100 350,350 450,30`：两个控制点分别为 `P1(180, -100)`和 `P2(350, 350)`，结束点为`P3(450, 30)`。

`animateMotion`通过`<animateMotion>`元素来实现沿路径移动的动画。它将动画与特定的SVG元素（如`<circle>`）关联，并通过`<mpath>`元素引用要沿着的路径。可以实现让SVG元素沿着复杂的路径进行动画，但**仅限于SVG内部元素**。

`offset-path`则使用CSS属性`offset-path`定义动画路径。通过`path("MP0 CP1 P2 P3")`来设置路径数据，并使用`offset-distance: n%;`来确定元素相对于路径起点的位置，配合
`@keyframes`关键帧实现跟随路径动画。但目前为止，[Can I Use](https://caniuse.com/?search=offset-path)上显示`offset-path`在移动端低版本浏览器上**兼容性不佳**。

#### Canvas路径动画
::: normal-demo (点击展开代码) Canvas实现
```html
<canvas id="stage" width="500" height="200"></canvas>
```
```javascript
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

// SP: startPoint       CP1: controlPoint1
// CP2: controlPoint2   EP: endPoint
const SP = { x: 50, y: 150 };
const CP1 = { x: 180, y: -100 };
const CP2 = { x: 359, y: 350 };
const EP = { x: 450, y: 30 };

const ball = { x: 0, y: 0, radius: 10 };

const duration = 5000;
let startTime = performance.now();

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 绘制路径
  ctx.beginPath();
  ctx.moveTo(SP.x, SP.y);
  ctx.bezierCurveTo(CP1.x, CP1.y, CP2.x, CP2.y, EP.x, EP.y);
  ctx.strokeStyle = 'orange';
  ctx.stroke();

  // 绘制移动小球
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#EDE5C0'; 
  ctx.fill();
}

const update = (time) => {
  let elapsedTime = (time - startTime);
  let progress = Math.max(Math.min(elapsedTime / duration, 1), 0);
  let t = progress;

  if (progress >= 1) {
  progress = 0
  startTime = performance.now();
  }

  ball.x = getCubicBezierPoint(t, SP.x, CP1.x, CP2.x, EP.x);
  ball.y = getCubicBezierPoint(t, SP.y, CP1.y, CP2.y, EP.y);
}

const animate = (time) => {
  update(time);
  draw();
  requestAnimationFrame(animate);
}

function getCubicBezierPoint(t, p0, p1, p2, p3) {
  const t2 = Math.pow(t, 2)
  const t3 = Math.pow(t, 3)
  return (p0 * Math.pow((1 - t), 3)) +
    (3 * p1 * t * Math.pow((1 - t), 2)) +
    (3 * p2 * t2 * (1 - t)) +
    (p3 * t3)
}

requestAnimationFrame(animate);
```
:::

在`Canvas`中，我们通过使用`moveTo(P0)`和`bezierCurveTo(P1, P2, P3)`方法绘制了一条三次贝塞尔曲线路径。然后再通过将`时间进度`作为`t值`进度参数，每帧从 `0 到 1` 累进跟新`t值`，并使用`getCubicBezierPoint(t, p0, p1, p2, p3)`方法计算曲线上从起点到终点的所有`x`和`y`坐标点值，让小球不断更新位置，从而实现了小球的曲线路径跟随动画。

#### 自定义绘制路径动画代码演示
下面是一个同时支持`SVG`和`Canvas`渲染的自定义绘制路径动画面板代码演示，通过下拉选框自由切换渲染模式。 

先通过鼠标再画板上自由绘制路径，然后点击`move按钮`启动小球跟随路径运动动画。

![图 7](/assets/posts/860b1c3eea3c17736fec3a803c37853c36f87814ee9b1da762c48f975b6c055e.gif)  

::: normal-demo (点击展开代码) 路径运动画板

```css
canvas, svg {
  display: block;
  background: #444;
}
```

```html
<canvas id="canvas" width="500" height="300"></canvas>
<svg 
  id="svg"
  version="1.1"
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xmlns="http://www.w3.org/2000/svg" width="500" height="300" style="display: none;">
</svg>

<button id="moveButton">Move</button>
<button id="resetButton">Reset</button>
<select id="modeSelect">
  <option value="canvas">Canvas</option>
  <option value="svg">SVG</option>
</select>
```
```javascript
(function() {
  // constants.js
  const DRAWING_STRATEGY_CANVAS = 'canvas'
  const DRAWING_STRATEGY_SVG = 'svg'
  const START_POINT_COLOR = 'red'
  const CONTROL1_POINT_COLOR = 'green'
  const CONTROL2_POINT_COLOR = 'blue'
  const END_POINT_COLOR = 'purple'
  const GUIDE_LINE_COLOR = '#cccccc'
  const BEZIER_CURVE_COLOR = 'orange'

  const POINT_TYPES = {
    START_POINT: 'startPoint',
    CONSTROL_POINT_1: 'controlPoint1',
    CONSTROL_POINT_2: 'controlPoint2',
    END_POINT: 'endPoint',
    NONE: 'none'
  }

  const DRAWING_STATUS = {
    START_POINT: POINT_TYPES.START_POINT,
    CONSTROL_POINT_1: POINT_TYPES.CONSTROL_POINT_1,
    CONSTROL_POINT_2: POINT_TYPES.CONSTROL_POINT_2,
    END_POINT: POINT_TYPES.END_POINT,
    COMPLETE: 'complete'
  }

  const DRAWING_DEFAULT_STRATEGY = DRAWING_STRATEGY_CANVAS

  // 曲线绘制创建工厂
  function createDrawingFactory(type) {
    switch (type) {
      case DRAWING_STRATEGY_CANVAS:
        return new CanvasDrawingStrategy(canvas)
      case DRAWING_STRATEGY_SVG:
        return new SvgDrawingStrategy(svg)
      default:
        throw new Error('Invalid drawing strategy type')
    }
  }

  // 三次贝塞尔曲线控制器
  // 负责创建并控制三次贝塞尔曲线的绘制、动画、重置以及切换绘制策略等
  class CubicBezierController {
    constructor(options) {
      this.createDrawingFactory = options?.createDrawingFactory
      this.movingAnimator = options?.movingAnimator
      this.mode = options?.mode || DRAWING_DEFAULT_STRATEGY
      this.drawer = this.createDrawer(this.mode)
    }
    
    createDrawer(mode) {
      const drawer = this.createDrawingFactory(mode)
      this.movingAnimator.addObserver(drawer)
      return drawer
    }

    switch(type = DRAWING_STRATEGY_CANVAS) {
      if (this.drawer) {
        this.movingAnimator.reset()
      }
      this.drawer = this.createDrawer(type)
    }

    reset() {
      this.drawer.reset()
    }

    play() {
      const points = this.drawer.getPoints()
      this.movingAnimator.startAnimation(points)
    }

  }

  // 移动小球动画类
  // 基于观察者简单实现： 当movingCircle被观察者 每帧发生变化 就通知所有观察者负责执行对应的操作
  class MovingCircleAnimator {
    constructor(options) {
      this.duration = options?.duration || 2000
      this.observers = new Set()
      this.circle = {
        x: 0, 
        y: 0,
        type: 'circle',
        color: '#00B3FF',
        radius: 10
      }
      this.movingPoints = []
      this.animationFrameId = 0
      this.animationStartTime = 0
    }

    addObserver(observer) {
      this.observers.add(observer)
    }

    removeObserver(observer) {
      this.observers.delete(observer)
    }

    notify() {
      const { circle } = this
      this.observers.forEach(observer => observer.animate(circle))
    }

    startAnimation(points) {
      this.animationStartTime = performance.now()
      this.movingPoints = points
      this.animationFrameId = requestAnimationFrame(this.animateFrame.bind(this))
    }

    stopAnimation() {
      if (this.animationFrameId) {
        this.animationFrameId = cancelAnimationFrame(this.animateFrame.bind(this))
      }
    }

    animateFrame(timestamp) {
      const { duration, animationStartTime, movingPoints } = this
      let progress = (timestamp - animationStartTime) / duration
      
      progress = Math.min(Math.floor(progress * 100) / 100, 1)

      this.movingWithCubicBezier(progress, movingPoints)
    
      this.notify()
      
      if (progress >= 1) {
        this.stopAnimation()
        return
      }
      this.animationFrameId = requestAnimationFrame(this.animateFrame.bind(this))
    }

    movingWithCubicBezier(progress, points) {
      const xCoords = points.map(point => point.x)
      const yCoords = points.map(point => point.y)
      // progress为x时间进度，可以假设x = t，单调递增，getBezierCurvePoint(progress, ...xCoords)表示求（对应坐标的）y运动值
      this.circle.x = getBezierCurvePoint(progress, ...xCoords)
      this.circle.y = getBezierCurvePoint(progress, ...yCoords)
    }

    reset() {
      this.circle.x = 0
      this.circle.y = 0
      this.movingPoints = []
      this.animationFrameId = 0
      this.animationStartTime = 0
      this.observers.clear()
    }
  }

  // 绘制策略基类
  class DrawingStrategy {
    constructor() {
      this.startPoint = this._generatePoint({ color: START_POINT_COLOR })
      this.controlPoint1 = this._generatePoint({ color: CONTROL1_POINT_COLOR })
      this.controlPoint2 = this._generatePoint({ color: CONTROL2_POINT_COLOR })
      this.endPoint = this._generatePoint({ color: END_POINT_COLOR })

      this.drawingStateManager = new DrawingStateManager()

      this.drawingStateManager.addActions({
        [DRAWING_STATUS.START_POINT]: {
          onMousedown: this.handleStartPointClick.bind(this),
        },
        [DRAWING_STATUS.CONSTROL_POINT_1]: {
          onMousedown: this.handleControlPoint1Click.bind(this),
        },
        [DRAWING_STATUS.CONSTROL_POINT_2]: {
          onMousedown: this.handleControlPoint2Click.bind(this),
        },
        [DRAWING_STATUS.END_POINT]: {
          onMousedown: this.handleEndPointClick.bind(this),
        },
        [DRAWING_STATUS.COMPLETE]: {
          onMousedown: this.handleCompleteClick.bind(this)
        }
      })


      this.guidelineWidth = 2
      this.guidelineColor = GUIDE_LINE_COLOR

      this.bezierCurveWidth = 5
      this.bezierCurveColor = BEZIER_CURVE_COLOR

      this.draggingPointType = POINT_TYPES.NONE
    }
    handleMouseDown(event) {}
    handleMouseMove(event) {}
    handleMouseUp(event) {
      this.draggingPointType = POINT_TYPES.NONE
    }
    handleDragging(position) {
      // 根据当前draggingPointType类型 更新对应的坐标点
      const pointMap = {
        [POINT_TYPES.START_POINT]: this.startPoint,
        [POINT_TYPES.CONSTROL_POINT_1]: this.controlPoint1,
        [POINT_TYPES.CONSTROL_POINT_2]: this.controlPoint2,
        [POINT_TYPES.END_POINT]: this.endPoint,
      }
      if (pointMap[this.draggingPointType]) {
        pointMap[this.draggingPointType].x =  position?.x
        pointMap[this.draggingPointType].y =  position?.y
      }
    }
    handleDrawing(position, state) {}

    handleStartPointClick(position) {
      const { x, y } = position
      this.startPoint.x = x
      this.startPoint.y = y
      this.drawingStateManager.change(DRAWING_STATUS.CONSTROL_POINT_1)
    }
    handleControlPoint1Click(position) {
      const { x, y } = position
      if (pointInCircle(position, this.startPoint)) {
        this.draggingPointType = POINT_TYPES.START_POINT
        return
      } 
      this.controlPoint1.x = x
      this.controlPoint1.y = y
      this.drawingStateManager.change(DRAWING_STATUS.CONSTROL_POINT_2)
    }
    handleControlPoint2Click(position) {
      const { x, y } = position
      if (pointInCircle(position, this.startPoint)) {
        this.draggingPointType = POINT_TYPES.START_POINT
        return
      }  else if (pointInCircle(position, this.controlPoint1)) {
        this.draggingPointType = POINT_TYPES.CONSTROL_POINT_1
        return
      }
      this.controlPoint2.x = x
      this.controlPoint2.y = y
      this.drawingStateManager.change(DRAWING_STATUS.END_POINT)
    }
    
    handleEndPointClick(position) {
      const { x, y } = position
      if (pointInCircle(position, this.startPoint)) {
        this.draggingPointType = POINT_TYPES.START_POINT
        return
      }  else if (pointInCircle(position, this.controlPoint1)) {
        this.draggingPointType = POINT_TYPES.CONSTROL_POINT_1
        return
      } else if (pointInCircle(position, this.controlPoint2)) {
        this.draggingPointType = POINT_TYPES.CONSTROL_POINT_2
        return
      }
      this.endPoint.x = x
      this.endPoint.y = y
      this.drawingStateManager.change(DRAWING_STATUS.COMPLETE)
    }

    handleCompleteClick(position) {
      if (pointInCircle(position, this.startPoint)) {
        this.draggingPointType = POINT_TYPES.START_POINT
      }  else if (pointInCircle(position, this.controlPoint1)) {
        this.draggingPointType = POINT_TYPES.CONSTROL_POINT_1
      } else if (pointInCircle(position, this.controlPoint2)) {
        this.draggingPointType = POINT_TYPES.CONSTROL_POINT_2
      } else if (pointInCircle(position, this.endPoint)) {
        this.draggingPointType = POINT_TYPES.END_POINT
      }
    }
    resetPoints() {
      this.startPoint = { ...this.startPoint, ...{ x: 0, y: 0 } }
      this.controlPoint1 = { ...this.controlPoint1, ...{ x: 0, y: 0 } }
      this.controlPoint2 = { ...this.controlPoint2, ...{ x: 0, y: 0 } }
      this.endPoint = { ...this.endPoint, ...{ x: 0, y: 0 } }

    }
    getPoints() {
      return [
        this.startPoint,
        this.controlPoint1,
        this.controlPoint2,
        this.endPoint
      ]
    }

    update() {}
    draw() {}
    animate(animator) {}
    reset() {}
    destroy() {}

    isEmptyPoint(point) {
      return point?.x === 0 && point?.y === 0
    }
    _generatePoint({ x= 0, y = 0, radius = 8, color = '#000'} = {}) {
      console.log(color)
      return {
        x,
        y,
        radius,
        color
      }
    }
  }

  // Canvas渲染绘制策略类
  class CanvasDrawingStrategy extends DrawingStrategy {
    constructor(canvas) {
      super()
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.boundHandleMouseDown = this.handleMouseDown.bind(this)
      this.boundHandleMouseMove = this.handleMouseMove.bind(this)
      this.boundHandleMouseUp = this.handleMouseUp.bind(this)
      this._bindEvent()
    }

    animate(animator) {
      this.draw()
      this.drawAnimator(animator)
    }
    
    reset() {
      this.drawingStateManager.reset()
      this.resetPoints()
      this.clear()
    }
    
    draw() {
      const { ctx, startPoint, controlPoint1, controlPoint2, endPoint } = this 
      const currentState = this.drawingStateManager.state
      const drawPoints = [startPoint, controlPoint1, controlPoint2, endPoint]

      this.clear()

      if (!this.isEmptyPoint(startPoint) && !this.isEmptyPoint(controlPoint1)) {
        this.drawGuideline(drawPoints)
      }
      

      if (currentState === DRAWING_STATUS.COMPLETE) {
        this.drawBezierCurve(drawPoints)
      }

      drawPoints.forEach(point => {
        if (!this.isEmptyPoint(point)) {
          this.drawCircle(point)
        }
      })
    }
    drawAnimator(animator) {
      const { type = '' } = animator

      switch (type) {
        case 'circle': 
          this.drawCircle(animator)
          break
        default: 
          console.log('The type is unknown')
      }
    }

    drawGuideline(points = []) {
      const { ctx, guidelineWidth, guidelineColor } = this
      if (points.length < 2) {
        return
      }

      ctx.beginPath()
      ctx.moveTo(points[0]?.x, points[0]?.y)

      for (let i = 1; i < points.length; i++) {
        const point = points[i]
        if (!this.isEmptyPoint(point)) {
          ctx.lineTo(point.x, point.y)
        }
      }

      ctx.lineWidth = guidelineWidth
      ctx.strokeStyle = guidelineColor
      ctx.stroke()
    }

    drawSegmentByPoint(point, position) {
      const points = [
        this.startPoint,
        this.controlPoint1,
        this.controlPoint2
      ]

      const drawingPoints = [
        ...points.slice(0, points.indexOf(point) + 1),
        position
      ]
      this.drawGuideline(drawingPoints)
    }

    drawBezierCurve(points = []) {
      const { ctx, bezierCurveWidth, bezierCurveColor } = this
      ctx.beginPath()
      ctx.moveTo(points[0]?.x, points[0]?.y)
      ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y)
      ctx.lineWidth = bezierCurveWidth
      ctx.strokeStyle = bezierCurveColor
      ctx.stroke()
    }

    drawCircle(point) {
      const { ctx } = this
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI)
      ctx.fillStyle = point.color
      ctx.fill()
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    handleMouseDown(event) {
      const currentState = this.drawingStateManager.state
      const mousePosition = getMousePosition(event)
      this.drawingStateManager.states[currentState].onMousedown(mousePosition)
      this.draw()
      event.preventDefault()
    }
    handleMouseMove(event) {
      const mousePosition = getMousePosition(event)
      const currentState = this.drawingStateManager.state
      if (this.draggingPointType === POINT_TYPES.NONE && 
        (currentState === DRAWING_STATUS.START_POINT || currentState === DRAWING_STATUS.COMPLETE)) {
        return 
      }

      this.draw()

      if (this.draggingPointType !== POINT_TYPES.NONE) {
        this.handleDragging(mousePosition)
      } else {
        this.handleDrawing(mousePosition, currentState)
      }
      event.preventDefault()
    }

    handleDrawing(position, status) {
      if (status === DRAWING_STATUS.CONSTROL_POINT_1 && !this.isEmptyPoint(this.startPoint)) {
        this.drawSegmentByPoint(this.startPoint, position)
      } else if (status === DRAWING_STATUS.CONSTROL_POINT_2 && !this.isEmptyPoint(this.controlPoint1)) {
        this.drawSegmentByPoint(this.controlPoint1, position)
      } else if (status === DRAWING_STATUS.END_POINT && !this.isEmptyPoint(this.controlPoint2)) {
        this.drawSegmentByPoint(this.controlPoint2, position)
      }
    }

    _bindEvent() {
      const { canvas } = this
      canvas.addEventListener('mousedown', this.boundHandleMouseDown)
      canvas.addEventListener('mousemove', this.boundHandleMouseMove)
      canvas.addEventListener('mouseup', this.boundHandleMouseUp)
      canvas.addEventListener('touchstart', this.boundHandleMouseDown)
      canvas.addEventListener('touchmove', this.boundHandleMouseMove)
      canvas.addEventListener('touchend', this.boundHandleMouseUp)
    }
    _removeEvent() {
      const { canvas } = this
      canvas.removeEventListener('mousedown', this.boundHandleMouseDown)
      canvas.removeEventListener('mousemove', this.boundHandleMouseMove)
      canvas.removeEventListener('mouseup', this.boundHandleMouseUp)
      canvas.removeEventListener('touchstart', this.boundHandleMouseDown)
      canvas.removeEventListener('touchmove', this.boundHandleMouseMove)
      canvas.removeEventListener('touchend', this.boundHandleMouseUp)
    }

    destroy() {
      this.reset()
      this._removeEvent()
    }
  }

  // Svg渲染绘制策略类
  class SvgDrawingStrategy extends DrawingStrategy {
    constructor(canvas) {
      super()
      this.svg = svg
      this.boundHandleMouseDown = this.handleMouseDown.bind(this)
      this.boundHandleMouseMove = this.handleMouseMove.bind(this)
      this.boundHandleMouseUp = this.handleMouseUp.bind(this)
      this._bindEvent()
    }

    animate(animator) {
      this.draw()
      this.drawAnimator(animator)
    }
    
    reset() {
      this.drawingStateManager.reset()
      this._removeEvent()
      this.resetPoints()
      this.clear()
    }

    draw() {
      const { ctx, startPoint, controlPoint1, controlPoint2, endPoint } = this 
      const currentState = this.drawingStateManager.state
      const drawPoints = [startPoint, controlPoint1, controlPoint2, endPoint]

      this.clear()

      if (!this.isEmptyPoint(startPoint) && !this.isEmptyPoint(controlPoint1)) {
        this.drawGuideline(drawPoints)
      }

      if (currentState === DRAWING_STATUS.COMPLETE) {
        this.drawBezierCurve(drawPoints)
      }

      drawPoints.forEach(point => {
        if (!this.isEmptyPoint(point)) {
          this.drawCircle(point)
        }
      })
    }

    drawAnimator(animator) {
      const { type = '' } = animator

      switch (type) {
        case 'circle': 
          this.drawCircle(animator)
          break
        default: 
          console.log('The type is unknown')
      }
    }

    drawGuideline(points = []) {
      const { ctx, guidelineWidth, guidelineColor } = this

      let moveToPath = `M${points[0].x} ${points[0].y}`
      let linePaths = []
      let pathString = ''

      // L${points[1].x} ${points[1].y} L${points[2]?.x} ${points[2]?.y} L${points[3]?.x} ${points[3]?.y}
      for (let i = 1; i < points.length; i++) {
        const point = points[i]
        if (!this.isEmptyPoint(point)) {
          linePaths.push(`L${point.x} ${point.y}`)
        } 
      }
      pathString = [moveToPath, ...linePaths].join(' ')

      const pathEl = createSvgElement('path', {
        d: pathString,
        stroke: guidelineColor,
        'stroke-width': guidelineWidth,
        fill: 'none'
      })
      this.svg.appendChild(pathEl)
    }

    drawSegmentByPoint(point, position) {
      const points = [
        this.startPoint,
        this.controlPoint1,
        this.controlPoint2
      ]

      const drawingPoints = [
        ...points.slice(0, points.indexOf(point) + 1),
        position
      ]
      this.drawGuideline(drawingPoints)
    }

    drawBezierCurve(points = []) {
      const { ctx, bezierCurveWidth, bezierCurveColor } = this
      let moveToPath = `M${points[0].x} ${points[0].y}`
      let linePaths = [
        `C${points[1].x} ${points[1].y}`,
        `${points[2].x} ${points[2].y}`,
        `${points[3].x} ${points[3].y}`
      ]
      const pathString = [moveToPath, ...linePaths].join(',')

      const pathEl = createSvgElement('path', {
          d: pathString,
          stroke: bezierCurveColor,
          'stroke-width': bezierCurveWidth,
          fill: 'none'
      })
      this.svg.appendChild(pathEl)
    }

    drawCircle(point) {
      const circleEl = createSvgElement('circle', {
        cx: point.x,
        cy: point.y,
        r: point.radius,
        fill: point.color
      })
      this.svg.appendChild(circleEl)
    }

    clear() {
      this.svg.innerHTML = ''
    }

    
    handleMouseDown(event) {
      const currentState = this.drawingStateManager.state
      const mousePosition = getMousePosition(event)
      this.drawingStateManager.states[currentState].onMousedown(mousePosition)
      this.draw()
    }
    handleMouseMove(event) {
      const mousePosition = getMousePosition(event)
      const currentState = this.drawingStateManager.state

      if (this.draggingPointType === POINT_TYPES.NONE && 
        (currentState === DRAWING_STATUS.START_POINT || currentState === DRAWING_STATUS.COMPLETE)) {
        return 
      }

      this.draw()

      if (this.draggingPointType !== POINT_TYPES.NONE) {
        this.handleDragging(mousePosition)
      } else {
        this.handleDrawing(mousePosition, currentState)
      }
    }

    handleDrawing(position, status) {
      if (status === DRAWING_STATUS.CONSTROL_POINT_1 && !this.isEmptyPoint(this.startPoint)) {
        this.drawSegmentByPoint(this.startPoint, position)
      } else if (status === DRAWING_STATUS.CONSTROL_POINT_2 && !this.isEmptyPoint(this.controlPoint1)) {
        this.drawSegmentByPoint(this.controlPoint1, position)
      } else if (status === DRAWING_STATUS.END_POINT && !this.isEmptyPoint(this.controlPoint2)) {
        this.drawSegmentByPoint(this.controlPoint2, position)
      }
    }

    _bindEvent() {
      const { svg } = this
      svg.addEventListener('mousedown', this.boundHandleMouseDown)
      svg.addEventListener('mousemove', this.boundHandleMouseMove)
      svg.addEventListener('mouseup', this.boundHandleMouseUp)
      
      svg.addEventListener('touchstart', this.boundHandleMouseDown)
      svg.addEventListener('touchmove', this.boundHandleMouseMove)
      svg.addEventListener('touchend', this.boundHandleMouseUp)
    }
    _removeEvent() {
      const { svg } = this
      svg.removeEventListener('mousedown', this.boundHandleMouseDown)
      svg.removeEventListener('mousemove', this.boundHandleMouseMove)
      svg.removeEventListener('mouseup', this.boundHandleMouseUp)
      
      svg.removeEventListener('touchstart', this.boundHandleMouseDown)
      svg.removeEventListener('touchmove', this.boundHandleMouseMove)
      svg.removeEventListener('touchend', this.boundHandleMouseUp)
    }

    destroy() {
      this.reset()
      this._removeEvent()
    }
  }


  // 绘制状态管理器
  class DrawingStateManager {
    constructor() {
      this.current = DRAWING_STATUS.START_POINT
      this.actions = {}
    }
    addActions(actions) {
      this.actions = actions
    }

    change(state) {
      if (this.current === state) {
        return
      }
      this.current = state
    }

    reset() {
      this.current = DRAWING_STATUS.START_POINT
    }

    get state() {
      return this.current
    }

    get states() {
      return this.actions
    }

  }

  // main
  const canvas = document.getElementById('canvas')
  const svg = document.getElementById('svg')
  const moveButtonEl = document.getElementById('moveButton')
  const resetButtonEl = document.getElementById('resetButton')
  const modeSelectEl = document.getElementById('modeSelect')

  let currentMode = DRAWING_DEFAULT_STRATEGY

  // 初始化运动小球类
  const movingCircleAnimator = new MovingCircleAnimator({
    duration: 1500
  })

  // 初始化三次贝塞尔曲线控制器
  const cubicBezierController = new CubicBezierController({ 
    mode: currentMode,
    createDrawingFactory,
    movingAnimator: movingCircleAnimator
  })


  // UI按钮和事件操作
  modeSelectEl.addEventListener('change', handleModeChange)
  moveButtonEl.addEventListener('click', handleMoveClick)
  resetButtonEl.addEventListener('click', handleResetClick)

  function handleModeChange() {
    const selectedMode = event.target.value

    if (selectedMode === DRAWING_STRATEGY_CANVAS) {
      svg.style.display = 'none'
      canvas.style.display = 'block'
    } else {
      canvas.style.display = 'none'
      svg.style.display = 'block'
    }
    cubicBezierController.switch(selectedMode)
    currentMode = selectedMode
  }

  function handleMoveClick() {
    cubicBezierController.play()
  }

  function handleResetClick() {
    cubicBezierController.reset()
  }

  // helper辅助工具方法
  function getMousePosition(event) {
    let clientX, clientY;

    // 如果是触摸
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const rect = (currentMode === DRAWING_STRATEGY_CANVAS ? canvas : svg).getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }


  function pointInCircle(position, circle) {
    const dx = position?.x - circle?.x
    const dy = position?.y - circle?.y
    return dx * dx + dy * dy <= circle.radius * circle.radius
  }

  function getBezierCurvePoint(t, p0, p1, p2, p3) {
    const t2 = Math.pow(t, 2)
    const t3 = Math.pow(t, 3)
    return (p0 * Math.pow((1 - t), 3)) + (3 * p1 * t * Math.pow((1 - t), 2)) + (3 * p2 * t2 * (1 - t)) + (p3 * t3)
  }

  function createSvgElement(tagName, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName)
    for (const attribute in attributes) {
      element.setAttribute(attribute, attributes[attribute])
    }
    return element
  }
})();

```
:::


#### 总结路径动画原理
在上述代码和演示中，我们实现了一个同时支持`SVG`和`Canvas`渲染的小球跟随路径（三次贝塞尔曲线）运动的动画。无论是`SVG`还是`Canvas`渲染，都需要经过以下几个步骤：

1. 首先，需要定义三次贝塞尔曲线的`四个控制点（起始点、两个控制点和终点）`。
2. 然后，使用`随着时间累加progress`作为`t`进度参数，随着动画的执行，`t`的值将在 `0 和 1` 之间不断累加。
3. 接下来，我们将当前的`t值`带入三次贝塞尔曲线公式，计算出每一帧小球在曲线上的当前位置（x 和 y 坐标）。
4. 最后，我们根据计算出的`x`和`y`坐标更新小球的位置，使其沿着`曲线`移动。

![图 10](/assets/posts/fd85c4d1b76e9ede179152beea6a50956594b73f4fa4f5d3c54bf1cdaf60b1b5.gif)  

因此，`三次贝塞尔路径运动动画`本质上是通过不断累加`t时间参数`进度来控制小球沿着由`控制点`生成的曲线路径运动的效果。这个过程可以类比为执行一个进度条，其中`t值`代表进度，从0逐渐增加到1，表示动画从开始到结束的整个过程。

然而，简单的累加`t值`可能导致动画的运动速度不够平滑和自然，因为在曲线的不同部分，速度可能会发生突变，累加的值不完全是均等的。为了优化这个问题，我们可以通过`三次贝塞尔`来引入`缓动动画（Easing Animation）`，以精确控制`t值`的变化速率，让动画在开始和结束时具有`更自然的加速和减速效果`，从而提高整体的动画质量和用户体验。

### 缓动动画

`缓动动画（Easing Animation）`在日常开发中非常常见，它主要**用于控制和调整动画的速率**，使动画呈现出更平滑流畅的过渡效果。它可以应用于`CSS3动画`和`JavaScript动画`。下面我们通过简单的应用例子来看看基本的用法。

在`CSS3动画`中，通过设置`transition-timing-function`或`animation-timing-function`属性来为动画或过渡效果指定一个自定义的三次贝塞尔曲线。
比如，通过[cubic-bezier.com](cubic-bezier.com/)可视化工具生成一个由**快到慢**速类似`ease-out`缓动效果的三次贝塞尔控制点值。
```css
animation-timing-function: cubic-bezier(.13,1.12,.6,1);
```

![图 13](/assets/posts/3f0e5e88b4e4231efabb49c3192ca5f68e0062d18eb25e68252317692360fce6.gif)  
  
而在`JavaScript动画`中，可以通过`Web Animations API`来快速创建一个缓动动画。
```javascript
const boxEl = document.getElementById('box')

// 创建一个新的动画
const animation = boxEl.animate(
  [
	  {transform: 'translateX(0px)'},
	  {transform: 'translateX(500px)'}
  ],
  {
	  duration: 3000,
	  easing: 'cubic-bezier(0.13, 1.12, 0.6, 1)',
	  fill: 'forwards'
  }
)

animation.onfinish = function() {
 console.log('The animation has completed')
}
```
或者通过**第三方缓动库**来实现，比如[tweenjs](https://github.com/tweenjs/tween.js)库
```javascript
const tween = new TWEEN.Tween({x: 0, y: 0})
  .to({x: 500, y: 200}, 3000) // 目标值和动画持续时间
  .easing(TWEEN.Easing.Cubic.Out) // 缓动值
  .onUpdate(() => {
    boxEl.style.transform = `translate(${this.x}px, ${this.y}px)`
})
```

#### 控制点对速度变化的影响

我们先来看看上述例子中的`cubic-bezier(.13,1.12,.6,1)`到底表示什么意思？ 

在`缓动函动画`中，上述例子中的四个值分别是由`(P1.x, P1.y)和(P2.x, P2.y)`表示的坐标点，是三次贝塞尔曲线中的两个控制点`P1`和`P2`，通过操作这两个点就能改变曲线形状，形状改变后影响最终的运动结果值，也就表现在动画的速度变化上。

那么，起始点和结束点呢？其实`在缓动动画里，由于只需要关注曲线的两个控制点来定义动画的速度变化，而无需考虑起始点和结束点的位置，所以，起始点固定为0，结束点固定为1`。可以将其分别表示动画的开始和结束状态，这种表示方式使得贝塞尔曲线更容易地描述动画过程中的速度变化。

另外，我们还可以通过一个辅助转换方法来`将当前曲线路径的绝对坐标值转为0-1区间的缓动坐标比例值`：
```javascript
// 转换代码示例
function coordsToEasingRatio(p0, p1, p2, p3) {
  // 计算 x 轴和 y 轴的范围
  const xRange = p3.x - p0.x;
  const yRange = p3.y - p0.y;
	
  // 计算 p1 和 p2 两个控制点相对于 p0 和 p3 的位置比例
  const p1x = (p1.x - p0.x) / xRange;
  const p1y = (p1.y - p0.y) / yRange;

  const p2x = (p2.x - p0.x) / xRange;
  const p2y = (p2.y - p0.y) / yRange;
	
  // 返回缓动比例对象，p0是固定0，p1是固定1
  return {
    p0: { x: 0, y: 0 },
    p1: { x: p1x, y: p1y },
    p2: { x: p2x, y: p2y },
    p3: { x: 1, y: 1 }
  }
}
// 用法
const p0 = { x: 100, y: 500 };
const p1 = { x: 160, y: 140 };
const p2 = { x: 640, y: 460 };
const p3 = { x: 700, y: 100 };

const ratioOfCoords = coordsToEasingRatio(p0, p1, p2, p3);
// output:
// p1: {x: 0.1, y: 0.9}   p2: {x: 0.9, y: 0.1} 
// cubic-bezier(0.1, 0.9, 0.9, 0.1)
```


接下来，我们通过示例图来说明控制点的改变会引起什么样的速度变化？  
首先看下面这张示例图：

![图 15](/assets/posts/a04d44b90695476a151e15f672df16f65b272699c256cd5448dd1c04c66280f5.png)  

可以看出来，在这个坐标图上，`横坐标`表示`时间进度`，`纵坐标`表示`动画进度`，整体表示的是动画过程中的`时间（t）`与`动画进度（p）`的关系。通过改变两个控制点的位置可以让`动画进度值`做加速、减速和匀速运动：

1. **加速**：当控制点越往上拉，那么曲线就越陡，也就是斜率越大的时候，在特定的`时间进度t`范围内，`进度值p`的值也就越大，而`进度p值`越大也就意味着在`单位时间t时刻`，运动所累加的值也就越大，最终的表现就是动画的速度也就越快了。下图呈现的效果是`先加速后减速(ease-out)`的过程：

- ![图 16](/assets/posts/d2d918d75d4c06c4fa6032d0bda754cc705f1c984442b45d90ec534a566872fc.png =300x)  

2. **减速**：当控制点越往下拉，那么曲线就越平缓，也就是斜率越小的时候，运动所累加的值也就越小，最终的表现就是动画的速度也就越慢了。下图呈现的效果是`先减速后加速(ease-in)`的过程：

- ![图 17](/assets/posts/e6399ac34dad6596a0b26e2469c26b0edbe1ad2c1b3d8ba67ce4d5fdc1f72415.png =300x)  


3. **匀速**：当控制点都集中在曲线上时，曲线的斜率在整个过程中保持相对恒定时，运动所累加的值也就比较稳定，最终的表现就是动画的速度平稳匀速。下图呈现的效果是`线性匀速(linear)`的过程:

- ![图 18](/assets/posts/aa275419911634b0c3966bcd59cad8971c31834931a5649e41063a4c12a6db4a.png =300x)  


总结就是：`当曲线向上越陡时候，速度越快。向下越平缓时候，速度越慢。保持在一条斜直线上时，逼近匀速状态。`

#### 计算缓动值实现精确速度调整

通过上述内容可知，`动画的速度快慢变化是由曲线的形状决定的`。曲线描述了元素在动画过程中的速度变化关系，而具体量化表示曲线速度变化的值称为`缓动函数值(easing function value)`。

`缓动函数值`是一个描述动画速度变化的值。`缓动函数`将动画的线性`时间进度t（即通过时间进度模拟t值）`映射到一个`非线性的值(缓动值)`。利用`缓动函数值`可以帮助我们实现更加自然、平滑且速度变化均匀的`加速`和`减速`效果，使动画看起来更自然和流畅。

在实际应用中，我们可以通过以下两种方式计算得出`缓动函数值`：

1. `简单的假设x时间进度等价于t值。`在这种情况下，我们可以直接将`时间进度值`作为`t值`带入贝塞尔曲线公式计算，例如在我们的路径动画的演示中，就是直接将`时间进度progress`作为`t值`代入求值。这种方法较为简单，但在复杂的曲线运动中可能会因为不精确的运动值结果导致运动速度的不均匀、不自然。因为当`时间进度`执行到一半0.5的时候，曲线的`t进度值`不一定就是0.5，是根据当前曲线的形状来决定的。

2. `使用数值方法（如牛顿法或二分法）求解t值。`这种方法可以求解出精确的`t值`，再将`t值`带入贝塞尔曲线公式计算。这种方法较为复杂，但在复杂的动画场景中可以得到更为精确的结果，从而实现动画速度的平滑过渡变化，让动画更加生动自然，这也是最常见推荐的方式。


下面我们通过代码演示来看看两者的差别：


![图 20](/assets/posts/b9114f1b2d4cf8bd8b525db2b5afe0041042b7637d52c4f0acfc34cbd0232312.gif)  


::: normal-demo 不精确的t值和缓动t值对比示例
```css
canvas {
  background: #fff;
}

button {
  position: absolute;
  top: 405px;
  left: 220px;
  width: 150px;
  height: 50px;
  margin-top: 10px;
  border: none;
  background: #ccc;
  cursor: pointer;
}
button:active {
  background: #f03;
  color:#fff;
}
```
```html
<canvas id="canvas" width="700" height="500"></canvas>
<button id="startAnimation">播放动画</button>
```
```javascript
(function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const startAnimation = document.getElementById('startAnimation');

  const p0 = { x: 100, y: 450 };
  const p1 = { x: 160, y: 140 };
  const p2 = { x: 540, y: 380 };
  const p3 = { x: 630, y: 100 };


  const xCoords = [p0.x, p1.x, p2.x, p3.x]
  const yCoords = [p0.y, p1.y, p2.y, p3.y]

  const { p1: rp1, p2: rp2 } = coordsToEasingRatio(p0, p1, p2, p3);

  const cubicBezierFunc = cubicBezier(rp1.x, rp1.y, rp2.x, rp2.y);

  let animationProgress = 0;
  let rafId;
  let aniamtionStartTime = 0
  let duration = 2000


  // 1 求出总范围  2 算出当前长度  3 除以总范围 得到 最终的 相对值
  function coordsToEasingRatio(p0, p1, p2, p3) {
    const xRange = p3.x - p0.x;
    const yRange = p3.y - p0.y;

    const p1x = (p1.x - p0.x) / xRange;
    const p1y = (p1.y - p0.y) / yRange;

    const p2x = (p2.x - p0.x) / xRange;
    const p2y = (p2.y - p0.y) / yRange;

    return {
      p0: { x: 0, y: 0 },
      p1: { x: p1x, y: p1y },
      p2: { x: p2x, y: p2y },
      p3: { x: 1, y: 1 }
    }
  }

  function getBezierCurvePoint(t, ...coords) {
    return (
      Math.pow(1 - t, 3) * coords[0] +
      3 * Math.pow(1 - t, 2) * t * coords[1] +
      3 * (1 - t) * Math.pow(t, 2) * coords[2] +
      Math.pow(t, 3) * coords[3]
    );
  }

  function drawBezierCurve() {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  function drawBalls() {
    // 拿到缓动值 0 - 1区间的进度值
    const preciseProgress = cubicBezierFunc(animationProgress);
    const impreciseProgress = animationProgress;

    // 精确
    // 常规的缓动直线运动
    // const preciseBallX = 100 + preciseProgress * 500
    // const preciseBallY = 300
    // 路径跟随运动
    const preciseBallX = getBezierCurvePoint(preciseProgress, ...xCoords)
    const preciseBallY = getBezierCurvePoint(preciseProgress, ...yCoords)

    // 不精确
    const impreciseBallX = getBezierCurvePoint(impreciseProgress, ...xCoords)
    const impreciseBallY = getBezierCurvePoint(impreciseProgress, ...yCoords)

    ctx.beginPath();
    ctx.arc(preciseBallX, preciseBallY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(impreciseBallX, impreciseBallY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.font = '16px Arial';
    ctx.fillStyle = 'blue';
    ctx.fillText('蓝色: 精确计算t值做缓动运动', 210, 80);
    ctx.fillStyle = 'red';
    ctx.fillText('红色: 不精确的t值做不明显的缓动运动', 210, 110);


    const straightBallStart = { x: 400, y: 400 };
    const straightBallEnd = { x: 650, y: 400 };


    ctx.beginPath();
    ctx.moveTo(straightBallStart.x, straightBallStart.y);
    ctx.lineTo(straightBallEnd.x, straightBallEnd.y);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 5;
    ctx.stroke();

    const linearBlueBallX = straightBallStart.x + preciseProgress * (straightBallEnd.x - straightBallStart.x);
    const linearBlueBallY = straightBallStart.y + preciseProgress * (straightBallEnd.y - straightBallStart.y);
    ctx.beginPath();
    ctx.arc(linearBlueBallX, linearBlueBallY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue';
    ctx.fill();

    const linearRedBallX = straightBallStart.x + impreciseProgress * (straightBallEnd.x - straightBallStart.x);
    const linearRedBallY = straightBallStart.y + impreciseProgress * (straightBallEnd.y - straightBallStart.y);
    ctx.beginPath();
    ctx.arc(linearRedBallX, linearRedBallY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();


    ctx.font = '16px Arial';
    ctx.fillStyle = 'blue';
    ctx.fillText('蓝色: 直线缓动', 400, 440);
    ctx.fillStyle = 'red';
    ctx.fillText('红色: 直线匀速', 400, 465);

  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animationProgress = Math.max(Math.min((time - aniamtionStartTime) / duration, 1), 0)

    drawBezierCurve();
    drawBalls();
    if (animationProgress >= 1) {
      return
    }

    requestAnimationFrame(animate)
  }

  startAnimation.addEventListener('click', () => {
    animationProgress = 0
    aniamtionStartTime = performance.now()
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(animate)
  })

  function cubicBezier(p1x, p1y, p2x, p2y) {
    const ZERO_LIMIT = 1e-6;
    // Calculate the polynomial coefficients,
    // implicit first and last control points are (0,0) and (1,1).
    const ax = 3 * p1x - 3 * p2x + 1;
    const bx = 3 * p2x - 6 * p1x;
    const cx = 3 * p1x;

    const ay = 3 * p1y - 3 * p2y + 1;
    const by = 3 * p2y - 6 * p1y;
    const cy = 3 * p1y;

    function sampleCurveDerivativeX(t) {
      // `ax t^3 + bx t^2 + cx t` expanded using Horner's rule
      return (3 * ax * t + 2 * bx) * t + cx;
    }

    function sampleCurveX(t) {
      return ((ax * t + bx) * t + cx) * t;
    }

    function sampleCurveY(t) {
      return ((ay * t + by) * t + cy) * t;
    }

    // Given an x value, find a parametric value it came from.
    function solveCurveX(x) {
      let t2 = x;
      let derivative;
      let x2;

      // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
      // first try a few iterations of Newton's method -- normally very fast.
      // http://en.wikipedia.org/wikiNewton's_method
      for (let i = 0; i < 8; i++) {
        // f(t) - x = 0
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < ZERO_LIMIT) {
          return t2;
        }
        derivative = sampleCurveDerivativeX(t2);
        // == 0, failure
        /* istanbul ignore if */
        if (Math.abs(derivative) < ZERO_LIMIT) {
          break;
        }
        t2 -= x2 / derivative;
      }

      // Fall back to the bisection method for reliability.
      // bisection
      // http://en.wikipedia.org/wiki/Bisection_method
      let t1 = 1;
      /* istanbul ignore next */
      let t0 = 0;

      /* istanbul ignore next */
      t2 = x;
      /* istanbul ignore next */
      while (t1 > t0) {
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < ZERO_LIMIT) {
          return t2;
        }
        if (x2 > 0) {
          t1 = t2;
        } else {
          t0 = t2;
        }
        t2 = (t1 + t0) / 2;
      }

      // Failure
      return t2;
    }

    function solve(x) {
      return sampleCurveY(solveCurveX(x));
    }

    return solve;
  }

  drawBezierCurve();
  drawBalls();

})();
```

:::

可以很明显看出来，直接使用时间进度作为`t值`的红色小球沿着曲线运动时，因为`时间进度`是线性累加的，所以`时间进度`与曲线上的位置关系是`线性`的，导致了红色小球的`运动速度`变化不太明显。 

而蓝色小球的运动是基于`缓动函数`的，它首先将`时间进度`输入到三次贝塞尔缓动函数中，得到一个`新的进度值`，然后将这个`新的进度值`作为`t值`输入到三次贝塞尔曲线中，这样，蓝色小球的运动速度会在曲线的不同部分发生较大的变化，表现出更明显的`加速`和`减速`效果。

那么由于第一种方法直接取时间进度作为`t参数`套入公式会导致不精确的结果值，因此不推荐作为动画计算使用。下面我们将重点讲第二种方法，也就是`数值方法求解t值`，通过将当前传入的时间进度来确定近似的`t值`，从而带入公式求出最终的精确平滑的`运动缓动值`。

#### 公式转方程求缓动值

首先我们为了反求公式中的`t值`，需要先将三次贝塞尔曲线公式转为一个`一元三次方程`，得到`t`的过程就是`解一元三次方程`的过程。下面是逐步顺序的转换过程：
1. 完整公式
$$ B(t) = P_0(1-t)^3 + 3P_1t(1-t)^2 + 3P_2t^2(1-t) + P_3t^3,\ 0 < t < 1 $$

2. 将公式按照方差规律展开  

根据完全立方差公式：$(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3
$，将
$$ P_0(1-t)^3 $$
转为
$$ P_0 - 3P_0t + 3P_0t^2 - P_0t^3 $$

接着按照完全平方差公式：$(a-b)^2 = a^2 - 2ab + b^2$
，将
$$ 3P_1t(1-t)^2 $$
展开变成
$$ 3P_1t - 2\cdot 3P_1t^2 + 3P_1t^3 $$
最后将
$$ 3P_2t^2(1-t) $$ 
转为
$$ 3P_2t^2 - 3P_2t^3 $$
合并上述步骤后，公式变成：
$$  B(t) =  P_0 - 3P_0t + 3P_0t^2 - P_0t^3 + 3P_1t - 2\cdot 3P_1t^2 + 3P_1t^3 + 3P_2t^2 - 3P_2t^3 + P_3t^3$$

3. 然后将展开后的公式进行`多项式合并`。首先先将相同的系数挪到一起，比如
$3P_0t^2$、$3P_1t^2$和$3P_2^2$是一项，$P_0t^3$ 、$3P_2t^3$和$P_3t^3$又是相同项。 
挪位后符号取反，得出结果为：
$$ B(t) =  (-P_0 + 3P_1 - 3P_2 + P_3)t^3 + (3P_0 - 2*3P_1 + 3P_2)t^2 + (-3P_0 + 3P_1)t + P_0 $$
整理`化简`后：
$$ B(t) =  (P_3 - P_0 - 3(P_2 - P_1))t^3 + (3(P_2 - P_1) + 3(P_0 - P_1))t^2 + 3(P_1 - P_0)t + P_0 $$

4. 再接着，由于在缓动动画中，`起始点是固定0(P0 = 0)`，`结束点是固定为1(P3 = 0)`，再带入进行化简最终结果为：
$$ B(t) = (1 - 3(P_2 - P_1))t^3 + (3(P_2 - P_1) - 3P_1)t^2 + 3P_1t $$

5. 最后，将其转为一元三次方程形式：$at^3 + bt^2 + ct + d = 0$  

- `提取三次项系数a`：在 `B(t)` 中，`三次项`是：$(1 - 3(P_2 - P_1))t^3$。因此
$$ a = 1-3(P_2-P_1) $$ 
展开并化简后
$$ a = 3P_1 - 3P_2 + 1 $$

- `提取二次项系数b`：在 `B(t)` 中，`二次项`是：$(3(P_2 - P_1) - 3P_1)t^2$ 。因此
$$ b = 3(P_2​−P_1​)−3P_1​ $$
展开并化简后
$$ b = 3P_2 - 6P_1 $$
- `提取一次项系数c`：在 `B(t)` 中，`一次项`是：$3P_1t$。因此
$$ c = 3P_1​ $$

- `提取常数项系数d`：在 `B(t)` 中，`没有常数项`。因此
$$ d = 0 $$

现在我们已经分别确定了`a`、`b`、`c` 和 `d`系数项，现将它们代入一元三次方程：
$$ (3P_1 - 3P_2 + 1)t^3 + (3P_2 - 6P_1)t^2 + 3P_1​ + 0 = 0 $$


6. 给定的方程 `B(t)` 已经转换为一元三次方程的形式
$$ at^3 + bt^2 + ct + d = 0 $$

#### 解方程求t值未知数

拿到一元三次方程后，接着便是求出方程中的`t值`，有三种方法可以求解：

1. `直接解方程`
2. `牛顿迭代法（切线逼近点）`
3. `二分法`

下面我们逐个对上述解法进行详细说明：

##### 1.直接解方程法

目前有两种著名的解三次方程的方法，分别是：
1. 意大利学者`卡尔丹`于`1545年`发表的[卡尔丹公式法](https://upimg.baike.so.com/doc/6656900-6870721.html)
2. 中国学者`范盛金`于`1989年`发表的[盛金公式法](https://baike.baidu.com/item/%E7%9B%9B%E9%87%91%E5%85%AC%E5%BC%8F/10581722)

相对来说，`盛金公式`是比较简洁清晰直观，可以优先考虑使用。但是，在实际项目中，求解过程可能会因为判别式的值而变得非常复杂，不建议直接解方程。所以就不具体说明了，感兴趣的可以[跳转这里了解原理](https://blog.csdn.net/u012912039/article/details/101363323)。

##### 2.牛顿迭代法（切线逼近点）

[牛顿迭代法](https://baike.baidu.com/item/%E7%89%9B%E9%A1%BF%E8%BF%AD%E4%BB%A3%E6%B3%95/10887580)的基本思路是`通过线性近似（切线逼近）来逐步逼近方程的根`，简单来讲，就是通过不断的迭代计算`当前(通常是x轴的时间进度值progress)点处`的`导数值(斜率)`，然后`判断(斜率)值是否满足指定精度范围`，如果满足则表示当前点已经非常靠近原点曲线了，这时候就可以认为这个`近似解就是最终t的值。`

![图 38](/assets/posts/a9f0839a4baa382f8c75ac58c2168bf454e3ecf5e2241b4d2dc5764bef6d6ecc.png)  


牛顿迭代法的步骤如下：
1. 设定一个最小`近似精度阈值`，一般`0.001`合适
2. 设定一个`最大迭代数`，一般`8-10`合适
3. 将当前已知的p点值为起始`t值`
4. 将t代入普通三次方程中求解`t点处的p点值`，并减去初始给定的`p值`，得到一个`误差值`
5. 同时再将`t`代入三次方程求导后的公式中计算当前`t`点处的`导数（斜率）值derivative`
- 三次方程 $at^3 + bt^2 + ct + d = 0$ 求导后转为 $3a^2t + 2bt + ct = 0$
6. 如果5和6的结果值大于`误差阈值`，则`t值`向结果值与斜率值递减(逼近) `t = t - (dist / derivative)`，接着继续回到第5步迭代计算
7. 如果结果值小于`误差阈值`，则直接跳出迭代，并返回最终的`近似t值`


下面是具体的代码示例：
```javascript
// newtonSolve 函数使用牛顿迭代法求解三次方程的根，即t值未知数
// 参数：p为传入的目标值（通常为时间进度值progress = (currentTime - startTime) / duration），a、b、c、d 为三次方程的系数
// 目的：找到与p点对应的t值
function newtonSolve(p, a, b, c, d) {
  let t = p // 初始化将x时间进度值作为迭代起始点
  const SLOPE_VALUE = 0.001 // 定义精度阈值
  const ITERATION = 8 // 定义最大迭代次数

  // 进行迭代计算
  for (let i = 0; i < ITERATION; i++) {
    // 计算当前点处的方程值与目标值的差距 即误差值
    const dist = cubicSolve(t, a, b, c, d) - p
    
    // 如果误差值小于精度阈值，说明找到了满足精度要求的解，跳出循环
    if (Math.abs(dist) < SLOPE_VALUE) {
      break
    }

    // 计算当前点处的导数值（斜率）
    const derivative = derivativeCubicSolve(t, a, b, c, d)

    // 如果导数值（斜率）小于精度阈值，说明该点处的斜率太小，可能无法收敛，跳出循环
    if (Math.abs(derivative) < SLOPE_VALUE) {
      break
    }

    // 根据牛顿迭代法公式，更新迭代点 t
    t = t - (dist / derivative)
  }

  // 返回找到的近似解
  return t
}

// cubicSolve 方法用于计算三次方程在某点的函数值
// 参数：t 为计算函数值的点，a、b、c、d 为三次方程的系数
function cubicSolve(t, a, b, c, p3) {
  // 三次方程的一般形式为：f(x) = a * x^3 + b * x^2 + c * x + p3

  // 根据三次方程的一般形式，计算函数值
  const functionValue = a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + p3

  return functionValue
}

// derivativeCubicSolve 方法用于计算三次方程在某点的导数值
function derivativeCubicSolve(t, a, b, c, p3) {
  // 三次方程的一般形式为：f(x) = a * x^3 + b * x^2 + c * x + p3
  // 对 f(x) 求导得到：f'(x) = 3 * a * x^2 + 2 * b * x + c

  // 根据求导公式，计算导数值
  const derivativeValue = 3 * a * Math.pow(t, 2) + 2 * b * t + c

  return derivativeValue
}
```

##### 3.二分法

[二分法](https://baike.baidu.com/item/%E4%BA%8C%E5%88%86%E6%B3%95/1364267?fr=aladdin)基本思路是`通过设定一个区间，然后以拆分减半的方式不断迭代缩小搜索范围，直到误差值符合指定精度范围内就返回特定值`。该方法是最简单最容易理解的方法，优先推荐使用。

二分法的步骤如下：
1. 设定一个`精度阈值`，一般为`0.0000001`。
2. 设定`范围区间`，根据`t = [0, 1]`，一般取`0-1`区间的值，即`t0 = 0`，`t1 = 1`。
3. 根据已知的`p点值`（通常是x轴的`时间进度值`）作为`起始模拟t值`。
4. 将`t值`代入普通三次方程中求解出`t点时贝塞尔曲线上对应的p点值`。
5. 当前的`p点值` 减去 `传入(目标)的p点值` 得到`误差值`。
6. 判断`误差值`是否`满足精度要求`。
7. 如果不满足，则`t值`在新的区间内继续迭代 `t = (t0 + t1) / 2`。
8. 如果满足，则该`t值`即为最终的求解值。


下面是具体的代码示例：
```javascript
// 目的：找到与p点对应的t值，a，b，c，d为三次方程的系数项
function bisectionSolve (p, a, b, c, d) {
  // 预设精度
  const SCOPE_LIMIT_VALUE = 0.0000001
  // 设定初始区间，根据贝塞尔 t = [0, 1]
  let t0 = 0
  let t1 = 1
  
  let t = p
  // 用二分法求解t的值，直到精度满足要求或者搜索区间足够小
  while (t0 < t1) {
    // 拿到当前计算结果与目标点值之间的差值，即误差值
    const dist = cubicSolve(t, a, b, c, d) - p
    
    // 如果误差值处于精度范围内 则跳出返回
    if (Math.abs(dist) < SCOPE_LIMIT_VALUE) {
	    break
    }
    // 如果误差值小于零 表示当前值小于目标值 需要将左区间缩至当前
    if (dist < 0) {
	    t0 = t
    } else {
	    t1 = t
    }
    t = (t0 + t1) / 2
  }
  return t
}

function cubicSolve(t, a, b, c, p3) {
  const functionValue = a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + p3
  return functionValue
}
```

最后，贴出一段`【WebKit C++实现中的三次贝塞尔缓动函数计算相对应的JavaScript版本代码】`源码：

```javascript
function cubicBezier(p1x, p1y, p2x, p2y) {
  // 定义了一个非常小的值（ZERO_LIMIT = 1e-6），用于后续比较精度时判断浮点数是否足够接近0。
  const ZERO_LIMIT = 1e-6;
  // 计算三次贝塞尔曲线的多项式系数。这里分别计算了关于 x 和 y 的多项式系数。
  // p0和p1默认值是固定的0和1，所以无需显示指定
  const ax = 3 * p1x - 3 * p2x + 1;
  const bx = 3 * p2x - 6 * p1x;
  const cx = 3 * p1x;

  const ay = 3 * p1y - 3 * p2y + 1;
  const by = 3 * p2y - 6 * p1y;
  const cy = 3 * p1y;
	
  // 计算贝塞尔曲线在参数 t 处的切线斜率（关于 x 轴的导数）
  function sampleCurveDerivativeX(t) {
    // 将原始公式方程 `ax t^3 + bx t^2 + cx t` 进行求导，得到一阶导数公式`3 * ax * t^2 + 2 * bx * t + cx`
    // 然后通过使用霍纳规则来展开化简
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function sampleCurveX(t) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t) {
    return ((ay * t + by) * t + cy) * t;
  }

  // 根据给定的 x 值找到对应的参数值 t
  function solveCurveX(x) {
    let t2 = x;
    let derivative;
    let x2;

    // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
    // 首先尝试使用牛顿法进行8次迭代，如果找到了一个足够接近的解，则返回 （效率最高）
    // http://en.wikipedia.org/wikiNewton's_method
    for (let i = 0; i < 8; i++) {
      // f(t) - x = 0
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      derivative = sampleCurveDerivativeX(t2);
      // == 0, failure
      /* istanbul ignore if */
      if (Math.abs(derivative) < ZERO_LIMIT) {
        break;
      }
      t2 -= x2 / derivative;
    }

    // 如果牛顿法失败，将使用二分法作为备选方法。
    // bisection
    // http://en.wikipedia.org/wiki/Bisection_method
    let t1 = 1;
    let t0 = 0;

    t2 = x;
    while (t1 > t0) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      if (x2 > 0) {
        t1 = t2;
      } else {
        t0 = t2;
      }
      t2 = (t1 + t0) / 2;
    }

    // Failure
    return t2;
  }

  function solve(x) {
    return sampleCurveY(solveCurveX(x));
  }

  return solve;
}

// 用法
const easeOutBezier = cubicBezier(0, 0.66, 0.61, 1);
const elapsedTime = currentTime - startTime;
const timeProgress = elapsedTime / duration;
const motionProgress = easeOutBezier(timeProgress);
const currentValue = motionProgress * target;
console.log(currentValue);
```
可以看出来，通过自定义传入两个控制点参数来初始化公式方程，然后调用接收`时间进度值`作为参数的`solve`闭包方法，接着`solveCurveX`方法首先尝试使用`牛顿法`来求解。如果`牛顿法`无法得到满足精度要求的解，将退回到使用`二分法`进行计算，最后，找到`近似t值`后，将其代入贝塞尔曲线公式中，以求出最终的`动画进度值`，也就是`缓动函数值`。


##### 总结缓动动画原理
在上述过程中，我们通过`牛顿迭代法`和`二分法`进行`误差校正`，以解出更接近输入`p（时间进度值）`的`近似t值`。然后，我们将该`t值`代入到三次贝塞尔曲线公式中，进一步求出具体的`运动进度值`，即`缓动函数值`。将`缓动函数值`与`目标运动值`相乘，就得到了当前的`具体运动值`。以`每秒60帧`的帧率更新动画值，随着`时间进度的推移`，一段具有`加速`、`减速`和`匀速`等效果的平滑流畅动画也就展现了出来。


## 总结
我们最后对全文做个简短概括性的总结：

```
1. 通过使用三次贝塞尔曲线公式，我们可以绘制复杂的曲线图形。
2. 利用这些曲线图形，可以使物体沿着特定路径进行运动。
3. 同时还能为常规物体动画提供加速、减速等更自然且平滑的过渡缓动效果。
4. 在运动动画过程中，如果只简单地将时间进度作为`t值`，而不精确地反算`t值`，则可能导致运动动画不精确且不平滑。
5. 为避免这个问题，我们需要使用三次贝塞尔公式方程来计算当前时间进度点时的精确`t值`。
6. 常规解方程求`t值`较为复杂，因此我们使用牛顿迭代法和二分法来模拟求解误差范围内的`t值`近似值。
7. 计算出精确的`t值`后，将其带入三次贝塞尔曲线公式中，求出物体的真实运动进度。
8. 将物体运动进度与目标值相乘，得到具体的运动值，每帧更新这些运动值，最终实现更自然且流畅的缓动动画。
```


总之，通过本文，我们从绘制一条`三次贝塞尔曲线`，到沿着曲线`路径运动`，再到`曲线缓动动画`的探讨，了解到`三次贝塞尔曲线`的强大功能，它既能利用四个控制点创建丰富复杂的路径图形，同时也能通过这些控制点计算出适用于平滑运动轨迹的`缓动值`，使得我们在实现动画时可以获得更加自然和流畅的效果，提升了动画的观感和用户体验。

![图 39](/assets/posts/2feb6e70e09dddbeb404fa897847d7c072ea37cec37545e18ad29fa162ee2448.jpg)  

可以说，`贝塞尔曲线`是一项伟大的发明，它不仅为计算机图形学和设计领域带来了精确高效的曲线控制，而且也极大地推动了动态视觉数字艺术的发展。

