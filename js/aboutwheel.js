var aboutWheel = new janvas.Canvas({
  container: "#app",
  duration: Infinity,
  interval: 16,
  props: {
    size: 50
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
      var cx = this.$width / 2, cy = this.$height / 2;
      this.img = new janvas.Image(this.$ctx, cx - this.size, cy - this.size,
        "img/complex.svg", cx, cy, this.size * 2, this.size * 2);
      this.img.getStyle().setStrokeStyle("grey");
      this.img.animationQueue = []; // 动画队列
      this.img.count = this.img.maxCount = Math.floor(256 / this.$interval);
      this.$raf.resume();
    },
    update: function (ts) {
      this.img.getMatrix().setAngle(Math.PI / 2000 * ts);
      this.scaleAnimation();
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.img.draw();
      if (this.img._mousein) this.img.stroke();
    }
  },
  events: {
    mousedown: function () {
      if (this.img._mousein) {
        this._mousedown = true;
        this.img.lastX = this.img.getStartX();
        this.img.lastY = this.img.getStartY();
      }
    },
    mousemove: function (ev) {
      if (this._mousedown) {
        var mx = this.img.lastX + ev.$moveX, my = this.img.lastY + ev.$moveY;
        this.img.init(mx, my, mx + this.size, my + this.size);
      } else {
        this.img._mousein = this.img.isPointInPath(ev.$x, ev.$y);
      }
    },
    mouseup: function () {
      this._mousedown = false;
    },
    wheel: function (ev) {
      /**
       * 当我们缩放一个对象的时候，有两种情况
       *   1. 中心点为 0, 0
       *     这种情况只能去缩放对象的 startX, startY
       *   2. 中心点不为 0, 0
       *     这种情况可选择缩放对象的 startX, startY
       *       因为存在中心点，所以在缩放后，需校准一次 offset，值为 _sx|_sy*(1-scale)
       *     也可以优先选择缩放对象的 centerX, centerY
       *       这样子就无需校准对象的 offset
       * 以上为笛卡尔坐标系内对象的缩放内容，当存在中心点时优先缩放中心点而不是起始绘制点
       * 其实就是一个比例问题（以下内容：target为目标点，event为事件点，point为对象点）
       *   缩放：(target-event)/scale=(point-event)/lastScale
       *   偏移：_sx|sy/1 = offset/(scale-1) // 存在中心点且缩放起始绘制点导致缩放图形而产生的偏移量
       */
      // 方式一（不推荐）：
      /*var targetSx = this.x + (this.img.getStartX() - this.x) * this.scaling,
        targetSy = this.y + (this.img.getStartY() - this.y) * this.scaling;
      this.img.init(targetSx, targetSy, targetSx + this.size, targetSy + this.size);
      this.img.getMatrix().setScale(this.scale, this.scale).setOffset(
        this.img._sx * (1 - this.scale), // 校正偏移量，不推荐此做法
        this.img._sy * (1 - this.scale)
      );*/
      // 方式二（推荐）：
      // var targetCx = ev.$x + (this.img.getCenterX() - ev.$x) * ev.$scaling,
      //   targetCy = ev.$y + (this.img.getCenterY() - ev.$y) * ev.$scaling;
      // this.img.init(targetCx - this.size, targetCy - this.size, targetCx, targetCy)
      //   .getMatrix().setScale(ev.$scale, ev.$scale);
      // 方式三：方式二的简单动画版本，有需求时有必要写进 components 里进行实现，以便解耦
      ev.preventDefault();
      if (ev.$scaling !== 1) this.img.animationQueue.unshift(ev);
    }
  },
  functions: {
    scaleAnimation: function () {
      if (this.img.animationQueue.length && this.img.count === this.img.maxCount) {
        var ev = this.img.animationQueue.pop();
        this.img.lastCx = this.img.getCenterX();
        this.img.lastCy = this.img.getCenterY();
        this.img.targetCx = ev.$x + (this.img.getCenterX() - ev.$x) * ev.$scaling;
        this.img.targetCy = ev.$y + (this.img.getCenterY() - ev.$y) * ev.$scaling;
        this.img.lastScale = ev.$lastScale;
        this.img.targetScale = ev.$scale;
        this.img.count = 0;
      }
      if (this.img.count < this.img.maxCount) {
        this.img.count++;
        var ratio = this.img.count / this.img.maxCount,
          stampCx = this.img.lastCx + (this.img.targetCx - this.img.lastCx) * ratio,
          stampCy = this.img.lastCy + (this.img.targetCy - this.img.lastCy) * ratio,
          scale = this.img.lastScale + (this.img.targetScale - this.img.lastScale) * ratio;
        this.img.init(stampCx - this.size, stampCy - this.size, stampCx, stampCy)
          .getMatrix().setScale(scale, scale);
      }
    }
  }
});
