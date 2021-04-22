var bezierMaker = new janvas.Canvas({
  container: "#app",
  duration: Infinity,
  interval: 16,
  props: {
    position: 0, // 指示器运行位置
    size: Math.floor(10000 / 16), // 10000ms/16ms，10秒运行次数
    keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Delete", "Enter", "w", "s", "a", "d", "q", "e"]
  },
  components: {
    factory: (function () {
      function Dot($ctx, x, y, index) {
        this._index = index;
        this._r = 5;
        this.arc = new janvas.Arc($ctx, 0, 0, this._r);
        this.text = new janvas.Text($ctx);
        this.setStart(x, y);
        this.initStyles();
        this.highlight(true);
      }

      Dot.prototype = {
        setStart: function (x, y) {
          this._x = x;
          this._y = y;
          this.arc.setStart(x, y);
          this.text.setStart(x + this._r * 2, y).setText(this.getReadableText());
        },
        getReadableText: function () {
          return "p" + this._index + "(" + this._x + "," + this._y + ")";
        },
        initStyles: function () {
          this.arc.getStyle().setStrokeStyle("hsl(0, 80%, 50%)").setLineWidth(2);
          this.text.getStyle().setFont("12px sans-serif").setTextAlign("start").setTextBaseline("middle");
        },
        drawHighlight: function () {
          this.arc.fillStroke();
          this.text.fill();
        },
        drawDefault: function () {
          this.arc.fill();
          this.text.fill();
        },
        highlight: function (flag) {
          if (this._highlight !== flag) {
            this._highlight = flag;
            this.draw = flag ? this.drawHighlight : this.drawDefault;
          }
        },
        mark: function () {
          this._lastX = this._x;
          this._lastY = this._y;
        },
        onmove: function (moveX, moveY) {
          this.setStart(this._lastX + moveX, this._lastY + moveY);
        },
        getX: function () {
          return this._x;
        },
        getY: function () {
          return this._y;
        },
        getIndex: function () {
          return this._index;
        },
        decreaseIndex: function () {
          this._index--;
          this.text.setText(this.getReadableText());
        },
        isPointInPath: function (x, y) {
          return this.arc.isPointInPath(x, y);
        }
      };

      return {
        _index: 0,
        newDot: function ($ctx, x, y) {
          return new Dot($ctx, x, y, this._index++);
        },
        decreaseAutoIndex: function () {
          this._index--;
        }
      };
    }())
  },
  methods: {
    init: function () {
      this.dots = [];
      this.polyline = new janvas.Polyline(this.$ctx, 0, 0, []);
      this.bezier = new janvas.Bezier(this.$ctx, 0, 0, this.polyline.getPoints(), this.size * 2);
      this.bezier.getStyle().setStrokeStyle("hsl(0, 80%, 50%)");
      this.transformedPoints = this.bezier.getTransformedPoints();
      this.hint = new janvas.Text(this.$ctx, 0, 0, "");
      this.hint.getStyle().setFillStyle("rgba(0, 0, 0, 0.5)")
        .setFont("12px sans-serif").setTextAlign("end").setTextBaseline("middle");
      this.cursor = new janvas.Triangle(this.$ctx, 0, 0);
      this.cursor.getStyle().setFillStyle("hsl(270, 80%, 50%)");
    },
    draw: function () {
      this.$clear();
      this.polyline.stroke();
      this.bezier.stroke();
      this.dots.forEach(function (dot) {
        dot.draw();
      });
      this.hint.fill();
      this.updateCursor();
      this.cursor.fill();
    }
  },
  events: {
    mousedown: function (ev) {
      if (this._autoResize) {
        // var _dispatch;
        if (ev.$x > this.$width * 0.875) this.$wrapper.style.width = this.$width * 1.5 + "px";
        if (ev.$y > this.$height * 0.875) this.$wrapper.style.height = this.$height * 1.5 + "px";
        // if (_dispatch) dispatchEvent(new Event("resize"));
        // if (_dispatch) {
        //   var ev = document.createEvent("Event");
        //   ev.initEvent("resize", true, true);
        //   dispatchEvent(ev);
        // }
      }
      if (ev.buttons === 4) {
        return;
      } else if (ev.buttons === 2) { // 鼠标右键
        this.dots.forEach(function (dot) {
          dot.mark();
        });
      } else { // 非右键，默认行为
        if (this.current) {
          this.toggleLocked(this.current);
        } else {
          if (this.locked) this.locked.highlight(false);
          this.dots.push(this.locked = this.current = this.factory.newDot(this.$ctx, ev.$x, ev.$y));
          this.polyline.append(ev.$x, ev.$y);
        }
        this.locked.mark();
      }
    },
    mousemove: function (ev) {
      if (ev.buttons === 2) { // 鼠标右键
        this.dots.forEach(function (dot) {
          dot.onmove(ev.$moveX, ev.$moveY);
          this.polyline.update(dot.getIndex(), dot.getX(), dot.getY());
        }, this);
      } else if (ev.buttons === 1) { // 鼠标左键
        this.locked.onmove(ev.$moveX, ev.$moveY);
        this.polyline.update(this.locked.getIndex(), this.locked.getX(), this.locked.getY());
      } else { // 无按键，默认行为
        if (this.current) this.current.highlight(false);
        this.current = void (0);
        this.dots.forEach(function (dot) {
          if (dot.isPointInPath(ev.$x, ev.$y)) this.current = dot;
        }, this);
        if (this.current) {
          this.locked.highlight(false);
          this.current.highlight(true);
        } else {
          if (this.locked) this.locked.highlight(true);
        }
      }
      this.hint.setStart(ev.$x, ev.$y).setText("(" + ev.$x + "," + ev.$y + ")");
    },
    mouseover: function () {
      this.$raf.resume();
    },
    mouseout: function () {
      this.$raf.pause();
    },
    keydown: function (ev) {
      if (this.locked === void (0)) return;
      if (this.keys.some(function (value) {
        return value === ev.key;
      })) ev.preventDefault();
      var increase = ev.repeat ? 5 : 1;
      switch (ev.key) {
        case "ArrowUp":
        case "w":
          this.locked.setStart(this.locked.getX(), this.locked.getY() - increase);
          this.polyline.update(this.locked.getIndex(), this.locked.getX(), this.locked.getY());
          break;
        case "ArrowDown":
        case "s":
          this.locked.setStart(this.locked.getX(), this.locked.getY() + increase);
          this.polyline.update(this.locked.getIndex(), this.locked.getX(), this.locked.getY());
          break;
        case "ArrowLeft":
        case "a":
          this.locked.setStart(this.locked.getX() - increase, this.locked.getY());
          this.polyline.update(this.locked.getIndex(), this.locked.getX(), this.locked.getY());
          break;
        case "ArrowRight":
        case "d":
          this.locked.setStart(this.locked.getX() + increase, this.locked.getY());
          this.polyline.update(this.locked.getIndex(), this.locked.getX(), this.locked.getY());
          break;
        case "Delete":
          if (this.dots.length > 0) {
            this.dots.forEach(function (dot, index) {
              if (index > this.locked.getIndex()) dot.decreaseIndex();
            }, this);
            this.factory.decreaseAutoIndex();
            this.dots.splice(this.dots.indexOf(this.locked), 1);
            this.polyline.delete(this.locked.getIndex());
            this.locked = this.dots[this.locked.getIndex()]
              || this.dots[this.locked.getIndex() - 1];
            if (this.locked) this.locked.highlight(true);
          }
          break;
        case "Enter":
          console.log("SOURCEDOTS: " + this.polyline.getTransformedPoints().toString());
          console.log("CALCULATED: " + this.bezier.getTransformedPoints().toString());
          break;
        case "q":
          this.toggleLocked(this.dots[this.locked.getIndex() - 1] || this.dots[this.dots.length - 1]);
          break;
        case "e":
          this.toggleLocked(this.dots[this.locked.getIndex() + 1] || this.dots[0]);
          break;
      }
    },
    autoResize: function (flag) {
      this._autoResize = flag;
    }
  },
  functions: {
    toggleLocked: function (dot) {
      this.locked.highlight(false);
      this.locked = dot;
      this.locked.highlight(true);
    },
    updateCursor: function () {
      var position = this.position, transformedPoints = this.transformedPoints;
      var x1 = transformedPoints[position], y1 = transformedPoints[position + 1], x2, y2;
      if (position !== 0) {
        x2 = transformedPoints[position - 2];
        y2 = transformedPoints[position - 1];
      } else {
        x2 = transformedPoints[position + 2];
        y2 = transformedPoints[position + 3];
      }
      this.position += 2;
      if (this.position === transformedPoints.length) this.position = 0;
      this.cursor.setStart(x1, y1).setRotation(Math.atan2(y1 - y2, x1 - x2));
    }
  }
});
bezierMaker.autoResize(true);
