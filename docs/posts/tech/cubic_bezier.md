---
date: 2022-10-02
category:
  - 技术
tag:
  - 前端
  - 动画
  - 三次贝塞尔 
---

# 聊聊Web应用中的三次贝塞尔曲线

![图 1](/assets/posts/860b1c3eea3c17736fec3a803c37853c36f87814ee9b1da762c48f975b6c055e.gif)  
![图 2](/assets/posts/fd85c4d1b76e9ede179152beea6a50956594b73f4fa4f5d3c54bf1cdaf60b1b5.gif)  

::: normal-demo Demo 演示


```html
<canvas id="stage"></canvas>
```

```js
 const WAVE_COUNT = 4;
        const GAME_VIEW_WIDTH = window.innerWidth;
        const GAME_VIEW_HEIGHT = window.innerHeight;

        const canvas = document.getElementById('stage');
        canvas.width = GAME_VIEW_WIDTH
        canvas.height = GAME_VIEW_HEIGHT
        const ctx = canvas.getContext('2d');
        const waveStartY = 420;
        let waveVy = 0;
        let amplitudeVy = 0;
        const waveHeights = new Array(WAVE_COUNT).fill(0).map(() => Math.random() * 20 + 5);
        let waveLevel = 15;
        // 1、确定浪的数量
        // 2、根据数量和总宽度确定每个浪的宽度
        // 3、每个浪的高度随机
        // 4、周期幅度运动根据浪的宽度来计算180度周期(半圆)
        // 5、浪的x轴做宽度周期变化
        // 6、浪的y轴做单个浪高度变化(当前宽度内算单个)
        function draw() {
            let waveHeight = 0;
            ctx.clearRect(0, 0, GAME_VIEW_WIDTH, GAME_VIEW_HEIGHT);
            ctx.beginPath();
            ctx.fillStyle = 'rgba(41, 157, 255, 0.8)';
            ctx.moveTo(0, waveStartY);
            amplitudeVy += 0.05;
            const waveWidth = Math.floor(GAME_VIEW_WIDTH / WAVE_COUNT);

            for (let i = 0; i < GAME_VIEW_WIDTH; i++) {
                const amplitudeX = -Math.sin((i / waveWidth) * Math.PI);
                let amplitudeHeight = 0;

                if (i % waveWidth === 0) {
                    const index = (i / waveWidth) === 0 ? 0 : (i / waveWidth) - 1;
                    waveLevel = waveHeights[index];
                }

                const amplitudeY = Math.sin(amplitudeVy) * 30;
                amplitudeHeight = Math.sin(amplitudeVy * 2 + (i / waveWidth)) * waveLevel;
                waveHeight = amplitudeHeight * amplitudeX + amplitudeY;
                ctx.lineTo(i, waveStartY + waveHeight);
            }

            ctx.lineTo(GAME_VIEW_WIDTH, waveStartY + (GAME_VIEW_HEIGHT - waveStartY));
            ctx.lineTo(0, waveStartY + (GAME_VIEW_HEIGHT - waveStartY));
            ctx.closePath();
            ctx.fill();
        }

        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        animate();
```

```css
    * {
            margin: 0;
            padding: 0;
        }
```

:::
