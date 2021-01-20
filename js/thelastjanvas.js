var theLastJanvas = new janvas.Canvas({
  container: "#app",
  interval: 16,
  components: {
    Dancer: (function () {
      function Dancer($ctx, $cfg, hsl, size, x, y, struct) {
        this.hsl = hsl;
        this.size = size;
        this._size = 16 * Math.sqrt(size);
        this.x = x;
        this.points = [];
        this.links = [];
        this.frame = 0;
        this.dir = 1;
        struct.points.forEach(function (point) {
          this.points.push(new Dancer.Point(size * point.x + x, size * point.y + y, point.fn));
        }, this);
        struct.links.forEach(function (link) {
          this.links.push(new Dancer.Link($ctx, $cfg,
            hsl.clone().setLightness(hsl.getLightness() * link.lum),
            link.size * size / 3,
            this.points[link.p0],
            this.points[link.p1],
            link.force,
            link.disk
          ));
        }, this);
      }

      Dancer.prototype.update = function (pointer) {
        if (++this.frame % 20 === 0) this.dir = -this.dir;
        if (this === pointer.dancerDrag && this.frame > 600 && this.size < 16) {
          this.onDragEnd.call(pointer.context, this);
        }
        this.links.forEach(function (link) {
          link.update();
        });
        this.points.forEach(function (point) {
          if (this === pointer.dancerDrag) {
            if (point === pointer.pointDrag) {
              point.x += (pointer.x - point.x) * 0.1;
              point.y += (pointer.y - point.y) * 0.1;
            }
          } else {
            point.fn(this._size, this.dir);
          }
          point.update();
        }, this);
        this.links.forEach(function (link) {
          var p1 = link.p1;
          if (p1.y > pointer.ground - link.size / 2) {
            p1.y = pointer.ground - link.size / 2;
            p1.x -= p1.vx;
            p1.vx = p1.vy = 0;
          }
        });
        this.points[3].x += (this.x - this.points[3].x) * 0.001;
      };

      Dancer.prototype.draw = function () {
        this.links.forEach(function (link) {
          link.draw();
        });
      };

      Dancer.Link = function ($ctx, $cfg, hsl, size, p0, p1, force, isHead) {
        this.$cfg = $cfg;
        this.hsl = hsl;
        this.size = size;
        this._offset = size / 10;
        this.p0 = p0;
        this.p1 = p1;
        this.distance = janvas.Utils.pythagorean(p1.x - p0.x, p1.y - p0.y);
        this.force = force || 0.5;
        this.shadow = new janvas.ShadowStyle().setShadowColor("rgba(0, 0, 0, 0.5)")
          .setShadowOffsetX(size / 4).setShadowOffsetY(size / 4);
        this.startRect = new janvas.Rect($ctx, 0, 0, size / 5, size / 5);
        this.endRect = new janvas.Rect($ctx, 0, 0, size / 5, size / 5);
        this.endRect.setMatrix(this.startRect.getMatrix());
        if (isHead) {
          this.head = new janvas.Arc($ctx, 0, 0, size / 2);
          this.head.getStyle().setFillStyle(this.hsl.toHslString());
          this._draw = this._drawHead;
        } else {
          this.body = new janvas.Line($ctx);
          this.body.getStyle().setStrokeStyle(this.hsl.toHslString()).setLineWidth(size);
          this._draw = this._drawBody;
        }
      };

      Dancer.Link.prototype = {
        update: function () {
          var p0 = this.p0, p1 = this.p1,
            dx = p1.x - p0.x, dy = p1.y - p0.y,
            dist = janvas.Utils.pythagorean(dx, dy),
            tw = p0.w + p1.w, r0 = p0.w / tw, r1 = p1.w / tw,
            dz = (this.distance - dist) * this.force,
            sx = dx / dist * dz, sy = dy / dist * dz;
          p1.x += sx * r0;
          p1.y += sy * r0;
          p0.x -= sx * r1;
          p0.y -= sy * r1;
        },
        draw: function () {
          this.$cfg.setShadowStyles(this.shadow);
          this._draw();
          this.$cfg.resetShadowStyles();
          var p0 = this.p0, p1 = this.p1, o = this._offset;
          this.startRect.getMatrix().setAngle(Math.atan2(p1.y - p0.y, p1.x - p0.x));
          this.startRect.init(p0.x - o, p0.y - o, p0.x, p0.y).fill();
          this.endRect.init(p1.x - o, p1.y - o, p1.x, p1.y).fill();
        },
        _drawHead: function () {
          this.head.initXY(this.p1.x, this.p1.y).fill();
        },
        _drawBody: function () {
          this.body.initXY(this.p0.x, this.p0.y).setEndX(this.p1.x).setEndY(this.p1.y).stroke();
        }
      };

      Dancer.Point = function (x, y, fn, w) {
        this.x = x;
        this.y = y;
        this.w = w || 0.5;
        this.fn = fn || janvas.Utils.noop;
        this.px = x;
        this.py = y;
        this.vx = 0;
        this.vy = 0;
      };

      Dancer.Point.prototype.update = function () {
        this.vx = this.x - this.px;
        this.vy = this.y - this.py;
        this.px = this.x;
        this.py = this.y;
        this.vx *= 0.995;
        this.vy *= 0.995;
        this.x += this.vx;
        this.y += this.vy + 0.01;
      };

      return Dancer;
    }())
  },
  props: {
    struct: {
      points: [
        {
          x: 0,
          y: -4,
          fn: function (s, d) {
            this.y -= 0.01 * s;
          }
        },
        {
          x: 0,
          y: -16,
          fn: function (s, d) {
            this.y -= 0.02 * s * d;
          }
        },
        {
          x: 0,
          y: 12,
          fn: function (s, d) {
            this.y += 0.02 * s * d;
          }
        },
        {x: -12, y: 0},
        {x: 12, y: 0},
        {
          x: -3,
          y: 34,
          fn: function (s, d) {
            if (d > 0) {
              this.x += 0.01 * s;
              this.y -= 0.015 * s;
            } else {
              this.y += 0.02 * s;
            }
          }
        },
        {
          x: 3,
          y: 34,
          fn: function (s, d) {
            if (d > 0) {
              this.y += 0.02 * s;
            } else {
              this.x -= 0.01 * s;
              this.y -= 0.015 * s;
            }
          }
        },
        {
          x: -28,
          y: 0,
          fn: function (s, d) {
            this.x += this.vx * 0.025;
            this.y -= 0.001 * s;
          }
        },
        {
          x: 28,
          y: 0,
          fn: function (s, d) {
            this.x += this.vx * 0.025;
            this.y -= 0.001 * s;
          }
        },
        {
          x: -3,
          y: 64,
          fn: function (s, d) {
            this.y += 0.015 * s;
            if (d > 0) {
              this.y -= 0.01 * s;
            } else {
              this.y += 0.05 * s;
            }
          }
        },
        {
          x: 3,
          y: 64,
          fn: function (s, d) {
            this.y += 0.015 * s;
            if (d > 0) {
              this.y += 0.05 * s;
            } else {
              this.y -= 0.01 * s;
            }
          }
        }
      ],
      links: [
        {p0: 3, p1: 7, size: 12, lum: 0.5}, // 左小臂
        {p0: 1, p1: 3, size: 24, lum: 0.5}, // 左大臂
        {p0: 1, p1: 0, size: 60, lum: 0.5, disk: 1}, // 头
        {p0: 5, p1: 9, size: 16, lum: 0.5}, // 左小腿
        {p0: 2, p1: 5, size: 32, lum: 0.5}, // 左大腿
        {p0: 1, p1: 2, size: 50, lum: 1}, // 身体
        {p0: 6, p1: 10, size: 16, lum: 1.5}, // 右小腿
        {p0: 2, p1: 6, size: 32, lum: 1.5}, // 右大腿
        {p0: 4, p1: 8, size: 12, lum: 1.5}, // 右小臂
        {p0: 1, p1: 4, size: 24, lum: 1.5} // 右大臂
      ]
    }
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      this.header = new janvas.Rect(this.$ctx, 0, 0);
      this.header.getStyle().setFillStyle("#222");
      this.footer = new janvas.Rect(this.$ctx, 0);
      this.footer.getStyle().setFillStyle("#222");
      this.dancers = [];
      this.pointer = {x: 0, y: 0, dancerDrag: null, pointDrag: null, ground: 0, context: this};
      this._otherStyle = new janvas.OtherStyle().setLineCap("round");
      this._initDancer();
    },
    resize: function () {
      this.$cfg.setOtherStyles(this._otherStyle);
      var w = this.$width, h = this.$height;
      this.background.setWidth(w).setHeight(h);
      this.header.setWidth(w).setHeight(h * 0.15);
      this.footer.setStartY(h * 0.85).setWidth(w).setHeight(this.header.getHeight());
      this.pointer.ground = h > 500 ? this.footer.getStartY() : h;
      for (var i = 0; i < this.dancers.length; i++) {
        this.dancers[i].x = (i + 2) * w / 9;
      }
    },
    draw: function () {
      this.background.fill();
      this.header.fill();
      this.footer.fill();
      this.dancers.forEach(function (dancer) {
        dancer.update(this.pointer);
        dancer.draw();
      }, this);
    },
    _initDancer: function () {
      var w = this.$width, h = this.$height;
      for (var i = 0; i < 6; i++) {
        this._pushDancer(
          new janvas.Hsl(i * 360 / 7, 30, 80),
          Math.sqrt(Math.min(w, h)) / 6,
          (i + 2) * w / 9,
          h * 0.5 - 100
        );
      }
    },
    _pushDancer: function (hsl, size, x, y) {
      var dancer = new this.Dancer(this.$ctx, this.$cfg, hsl, size, x, y, this.struct);
      dancer.onDragEnd = this._onDancerDragEnd;
      this.dancers.push(dancer);
    },
    _onDancerDragEnd: function (dancer) {
      var hsl = dancer.hsl, pointer = this.pointer;
      pointer.dancerDrag = null;
      this._pushDancer(
        hsl.clone().setHue(hsl.getHue() + 90).setLightness(hsl.getLightness() * 1.25),
        dancer.size * 2,
        pointer.x,
        pointer.y - 100 * dancer.size * 2
      );
      this.dancers.sort(function (d0, d1) {
        return d0.size - d1.size;
      });
    }
  },
  events: {
    eventdown: function (ev) {
      var pointer = this.pointer;
      pointer.x = ev.$x;
      pointer.y = ev.$y;
      this.dancers.forEach(function (dancer) {
        dancer.points.forEach(function (point) {
          if (janvas.Utils.pythagorean(ev.$x - point.x, ev.$y - point.y) < 60) {
            pointer.dancerDrag = dancer;
            pointer.pointDrag = point;
            dancer.frame = 0;
          }
        });
      });
    },
    eventmove: function (ev) {
      this.pointer.x = ev.$x;
      this.pointer.y = ev.$y;
    },
    eventup: function () {
      this.pointer.dancerDrag = null;
    },
    visibilitychange: function (visible) {
      visible ? this.$raf.resume() : this.$raf.pause();
    },
    mousedown: function (ev) {
      this.eventdown(ev);
    },
    mousemove: function (ev) {
      this.eventmove(ev);
    },
    mouseup: function () {
      this.eventup();
    },
    touchstart: function (ev) {
      ev.preventDefault();
      this.eventdown(ev.targetTouches[0]);
    },
    touchmove: function (ev) {
      ev.preventDefault();
      this.eventmove(ev.targetTouches[0]);
    },
    touchend: function () {
      this.eventup();
    }
  }
});
