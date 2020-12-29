# JanvasExamples

Examples created with [janvas](https://github.com/jarenchow/janvas).

## 使用示例

- 方式一
  1. 准备一个容器 div：`<div id="app" style="width: 100%;height: 100%;"></div>`
  2. 添加 janvas 库：`<script src="https://cdn.jsdelivr.net/npm/janvas/dist/janvas.min.js"></script>`
  3. 添加 janvasexamples 库：`<script src="https://cdn.jsdelivr.net/npm/janvasexamples/dist/janvasexamples.min.js"></script>`
  4. 填充 div：`var fly = janvasexamples.flydots("#app")`
- 方式二（在 [vue](https://github.com/vuejs/vue) 中使用）
  1. 准备一个容器 div：`<div ref="container" style="width: 100%;height: 100%;"></div>`
  2. `npm install janvasexamples --save`
  3. 填充 div：`var fly = janvasexamples.flydots(this.$refs.container);`

## [About AntV Performance Test](https://jarenchow.github.io/JanvasExamples/html/about_antv_performance_test.html)

原示例：[https://g6.antv.vision/zh/examples/performance/perf#moreData](https://g6.antv.vision/zh/examples/performance/perf#moreData)，如其所说：

> 对 G6 的性能测试，用来验证 G6 能够承载的数据量，分别使用 5000+ 图元、将近 20000 图元及 50000+ 图元的示例进行了测试，从结果来看，20000 左右图元时，G6 是可以正常交互的，当数据量达到 50000+ 时，交互就会出现一定的卡顿，但对于绝大部分业务来说，都不建议在画布上展示如此多的数据，具体的做法可以参考 AntV G6 团队的大图可视化方案，预计 1122 发布

而使用 **janvas** 从低抽象角度来定制，数据量即使达到 **50000\+** 时，依然可以**缩放**、**拖曳**以及**自定义更多交互**。

## [TaiChi](https://jarenchow.github.io/JanvasExamples/html/taichi.html)

太极图可由外圆，左半圆，右半圆，上下中小圆，一共 **7** 个圆形组成，不到两百行代码构建太极屏保，包含旋转、渐变、碰撞检测等。

## [SVG Support](https://jarenchow.github.io/JanvasExamples/html/tiger.html)

依据 svg 数据生成的组合图形仍然具有范围检测、样式自定义及矩阵变形的功能。

## [Clock](https://jarenchow.github.io/JanvasExamples/html/clock.html)

秒针使用了 **janvas** 中自带的高阶贝塞尔曲线实现动画，阴影偏移量随时间偏移。

[![image-20200316105934566](https://cdn.jsdelivr.net/gh/JarenChow/ImageHosting@master/image/janvas/clock.gif)](https://jarenchow.github.io/JanvasExamples/html/clock.html)

## [BezierMaker](https://jarenchow.github.io/JanvasExamples/html/beziermaker.html)

- 鼠标点击生成一个数据点
- 鼠标右键拖曳所有数据点
- 响应键盘 wasd/方向键 控制节点位置
- 响应键盘 q/e 切换当前节点
- 响应键盘 Delete 删除节点
- 响应 Enter 从控制台打印原始数据点与计算后的数据点

## [FlyDots](https://jarenchow.github.io/JanvasExamples/html/flydots.html)

使用 **janvas** 简单轻松绘制的不算特效的特效。

## [AboutWheel](https://jarenchow.github.io/JanvasExamples/html/about_wheel.html)

缩放公式：target = event + (source - event) * scale / lastScale;

在 **janvas** 中读取一张 SVG 图片，并随时间旋转，随鼠标响应范围检测并拖曳，随滚轮实现无损缩放的示例。

## [AboutEdge](https://jarenchow.github.io/JanvasExamples/html/about_edge.html)

v2.1.0 新增绘制连线的 Edge 类，实现了图数据库中的连线的样式。
