(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('janvas')) :
    typeof define === 'function' && define.amd ? define(['janvas'], factory) :
      (global = global || self, global.janvasexamples = factory(global.janvas));
}(this, function (janvas) {"use strict"

function coordinate(container) {
  return new janvas.Canvas({
  container: container,
  props: {
    _backgroundColor: "rgb(237, 237, 237)",
    _font: "12px Consolas",
    _span: 50,
    _dash: [10, 5],
    _dashColor: "rgba(0, 0, 0, 0.2)"
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, 0, 0);
      this.xAxis = new janvas.Arrow(this.$ctx, 0, 0, 0, 0);
      this.yAxis = new janvas.Arrow(this.$ctx, 0, 0, 0, 0);
      this.xLines = [];
      this.xTexts = [];
      this.yLines = [];
      this.yTexts = [];
      this.oText = new janvas.Text(this.$ctx, 0, 0, "0");
    },
    draw: function () {
      this.background.fill();
      this.xAxis.stroke();
      this.yAxis.stroke();
      this.xLines.forEach(function (line) {
        line.stroke();
      });
      this.yLines.forEach(function (line) {
        line.stroke();
      });
      this.xTexts.forEach(function (text) {
        text.fill();
      });
      this.yTexts.forEach(function (text) {
        text.fill();
      });
      this.oText.fill();
    }
  },
  events: {
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
      this.xAxis.initXY(this.$width, 0);
      this.yAxis.initXY(0, this.$height);
      this.adjustLength(Math.floor(this.$width / this._span - 0.2), this.xTexts, this.xLines, true);
      this.adjustLength(Math.floor(this.$height / this._span - 0.2), this.yTexts, this.yLines, false);
      this.setStyles();
    }
  },
  functions: {
    setStyles: function () {
      this.background.getStyle().setFillStyle(this._backgroundColor);
      this.oText.getStyle().setFont(this._font).setTextBaseline("top");
      this.xLines.forEach(function (line) {
        line.getStyle().setStrokeStyle(this._dashColor).setLineDash(this._dash);
      }, this);
      this.yLines.forEach(function (line) {
        line.getStyle().setStrokeStyle(this._dashColor).setLineDash(this._dash);
      }, this);
      this.xTexts.forEach(function (text) {
        text.getStyle().setFont(this._font).setTextAlign("center").setTextBaseline("top");
      }, this);
      this.yTexts.forEach(function (text) {
        text.getStyle().setFont(this._font).setTextBaseline("middle");
      }, this);
    },
    adjustLength: function (count, texts, lines, inAxisX) {
      var len, pos;
      while ((len = lines.length) < count) {
        pos = (len + 1) * this._span;
        if (inAxisX) {
          texts.push(new janvas.Text(this.$ctx, pos, 0, pos + ""));
          lines.push(new janvas.Line(this.$ctx, pos, 0, pos, 0));
        } else {
          texts.push(new janvas.Text(this.$ctx, 0, pos, pos + ""));
          lines.push(new janvas.Line(this.$ctx, 0, pos, 0, pos));
        }
      }
      if (count >= 0) texts.length = lines.length = count;
      lines.forEach(function (line) {
        inAxisX ? line.setEndY(this.$height) : line.setEndX(this.$width);
      }, this);
    }
  }
});
}

function antv(container) {
  return new janvas.Canvas({
  container: container,
  components: {
    factory: (function () {
      function Node(ctx, id, x, y, label) {
        this._defaultRadius = 1;
        this._scale = 1;
        this._showText = false;
        this.arc = new janvas.FixedArc(ctx, 0, 0, this._defaultRadius);
        this._arc = new janvas.FixedRect(ctx,
          -this._defaultRadius, -this._defaultRadius,
          this._defaultRadius * 2, this._defaultRadius * 2);
        this._arc.setMatrix(this.arc.getMatrix());
        this._arc.setStyle(this.arc.getStyle());
        this.text = new janvas.Text(ctx, 0, 0, label || id);
        this.text.getStyle().setFont("1.5px sans-serif").setTextBaseline("middle");
        this.setXY(x, y);
        this.highlight(false);
        this.draw = this.fillStroke;
      }

      Node.prototype = {
        setXY: function (x, y) {
          this.arc.getMatrix().setOffset(this.x = x, this.y = y);
          this.text.init(x + this._defaultRadius * this._scale * 2, y,
            x + this._defaultRadius * this._scale * 2, y);
        },
        getX: function () {
          return this.x;
        },
        getY: function () {
          return this.y;
        },
        getLabel: function () {
          return this.text.getText();
        },
        setScale: function (scale) {
          this._scale = scale;
          this.arc.getMatrix().setScale(scale, scale);
          this.text.getMatrix().setScale(scale, scale);
        },
        fillStroke: function () {
          this.arc.fillStroke();
          if (this._showText) this.text.fill();
        },
        onlyFill: function () {
          this._arc.fill();
        },
        in: function (bg) {
          return janvas.Collision.rect(
            this.x - this._defaultRadius * this._scale,
            this.y - this._defaultRadius * this._scale,
            this.x + this._defaultRadius * this._scale,
            this.y + this._defaultRadius * this._scale,
            bg.sx, bg.sy, bg.sw, bg.sh);
        },
        isPointInPath: function (x, y) {
          return this._arc.isPointInPath(x, y);
        },
        highlight: function (flag) {
          if (flag) this.arc.getStyle().setFillStyle("#FF0000")
            .setStrokeStyle("#000000").setLineWidth(1);
          else this.arc.getStyle().setFillStyle("#C6E5FF")
            .setStrokeStyle("#5B8FF9").setLineWidth(0.3);
        },
        showText: function (flag) {
          this._showText = flag;
        },
        mark: function () {
          this.lastX = this.x;
          this.lastY = this.y;
        },
        drag: function (moveX, moveY) {
          this.setXY(this.lastX + moveX, this.lastY + moveY);
        },
        wheel: function (x, y, scaling, scale) {
          this.setScale(scale);
          this.setXY(x + (this.x - x) * scaling, y + (this.y - y) * scaling);
          this.draw = scale * this._defaultRadius < 1 ? this.onlyFill : this.fillStroke;
        }
      };

      function Edge(ctx, source, target) {
        this._show = true;
        this.source = source;
        this.target = target;
        this.line = new janvas.Line(ctx, 0, 0, 0, 0);
        this.line.getStyle().setStrokeStyle("#333333").setLineWidth(0.1);
        this.refresh();
      }

      Edge.prototype = {
        draw: function () {
          if (this._show) this.line.stroke();
        },
        refresh: function () {
          this.line.initXY(this.source.getX(), this.source.getY())
            .setEndX(this.target.getX()).setEndY(this.target.getY());
        },
        setLineWidth: function (scale) {
          this.line.getStyle().setLineWidth(scale / 10);
        },
        show: function (flag) {
          this._show = flag;
        }
      };

      function Hint(ctx, cfg) {
        this._show = false;
        this._of = this._pdt = 3; // offset, paddingLeft, paddingTop
        this._pdl = 5;
        this.cfg = cfg;
        this.roundRect = new janvas.RoundRect(ctx, 0, 0, 0, 0);
        this.roundRect.getStyle().setFillStyle("white").setStrokeStyle("white");
        this.text = new janvas.Text(ctx, 0, 0, "");
        this.text.getStyle().setFont("12px sans-serif").setTextBaseline("bottom");
        this.shadow = new janvas.ShadowStyle().setShadowBlur(20).setShadowColor("grey");
      }

      Hint.prototype = {
        draw: function () {
          if (this._show) {
            this.cfg.setShadowStyles(this.shadow);
            this.roundRect.fillStroke();
            this.cfg.resetShadowStyles();
            this.text.fill();
          }
        },
        setXY: function (x, y) {
          x += this._of;
          y -= this._of;
          this.text.initXY(x + this._pdl, y - this._pdt);
          this.roundRect.initXY(x, y).setWidth(this._textWidth + this._pdl * 2)
            .setHeight(-(this._textHeight + this._pdt * 2)).setRadius();
        },
        setLabel: function (label) {
          if (this.label === label) return;
          this.label = label;
          this.text.setText(label);
          var metrics = janvas.Utils.measureText(label, this.text.getStyle().getFont());
          this._textWidth = metrics.width;
          this._textHeight = metrics.height;
        },
        show: function (flag) {
          this._show = flag;
        }
      };

      return {
        nodesMap: new Map(),
        newNode: function (id, x, y, label) {
          var node = new Node(this.$ctx, id, x, y, label);
          this.nodesMap.set(id, node);
          return node;
        },
        newEdge: function (source, target) {
          source = this.nodesMap.get(source);
          target = this.nodesMap.get(target);
          return source && target ? new Edge(this.$ctx, source, target) : void (0);
        },
        newHint: function () {
          return new Hint(this.$ctx, this.$cfg);
        }
      };
    }())
  },
  methods: {
    init: function () {
      this.nodes = [];
      this.edges = [];
      this.hint = this.factory.newHint();
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.edges.forEach(function (edge) {
        edge.draw();
      });
      this.nodes.forEach(function (node) {
        if (node.in(this.background)) node.draw();
      }, this);
      this.hint.draw();
    },
    data: function (res) {
      this.nodes.length = this.edges.length = 0;
      res.nodes.forEach(function (node) {
        this.nodes.push(this.factory.newNode(node.id,
          node.x, node.y, node.olabel));
      }, this);
      res.edges.forEach(function (edge) {
        edge = this.factory.newEdge(edge.source, edge.target);
        if (edge) this.edges.push(edge);
      }, this);
      this.draw();
    }
  },
  events: {
    mousedown: function () {
      this._mousedown = true;
      this.nodes.forEach(function (node) {
        node.mark();
      });
      if (this._current === void (0)) {
        this.edges.forEach(function (edge) {
          edge.show(false);
        });
      }
      this.draw();
    },
    mousemove: function (ev) {
      if (this._mousedown) {
        if (this._current === void (0)) {
          this.nodes.forEach(function (node) {
            node.drag(ev.$moveX, ev.$moveY);
          }, this);
        } else {
          this._current.drag(ev.$moveX, ev.$moveY);
          this.hint.setXY(ev.$x, ev.$y);
          this.edges.forEach(function (edge) {
            edge.refresh();
          });
        }
      } else {
        var mousein = true;
        this.nodes.forEach(function (node) {
          if (node.isPointInPath(ev.$x, ev.$y)) {
            this._current = node;
            mousein = false;
          }
          node.highlight(false);
        }, this);
        if (mousein) {
          this._current = void (0);
          this.hint.show(false);
        } else {
          this._current.highlight(true);
          this.hint.setLabel(this._current.getLabel());
          this.hint.setXY(ev.$x, ev.$y);
          this.hint.show(true);
        }
      }
      this.draw();
    },
    mouseup: function () {
      this._mousedown = false;
      this.edges.forEach(function (edge) {
        edge.show(true);
        edge.refresh();
      });
      this.draw();
    },
    wheel: function (ev) {
      this.nodes.forEach(function (node) {
        node.wheel(ev.$x, ev.$y, ev.$scaling, ev.$scale)
      }, this);
      this.edges.forEach(function (edge) {
        edge.refresh();
        edge.setLineWidth(ev.$scale);
      }, this);
      this.draw();
    },
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
    }
  }
});
}

function taichi(container) {
  return new janvas.Canvas({
  container: container,
  interval: 16.67,
  times: -1,
  props: {
    addCount: 0,
    taichi: []
  },
  components: {
    factory: (function () {
      function Taichi(ctx, x, y, r) {
        var outer = new janvas.Arc(ctx, x, y, r);
        outer.getStyle().setLineWidth(r / 8);
        var left = new janvas.Arc(ctx, x, y, r, Math.PI / 2, -Math.PI / 2, false, x, y);
        var right = new janvas.Arc(ctx, x, y, r, Math.PI / 2, -Math.PI / 2, true, x, y);
        right.getStyle().setFillStyle("white");
        var top = new janvas.Arc(ctx, x, y - r / 2, r / 2, 0, Math.PI * 2, false, x, y);
        var bottom = new janvas.Arc(ctx, x, y + r / 2, r / 2, 0, Math.PI * 2, false, x, y);
        bottom.getStyle().setFillStyle("white");
        var topSmall = new janvas.Arc(ctx, x, y - r / 2, r / 8, 0, Math.PI * 2, false, x, y);
        var bottomSmall = new janvas.Arc(ctx, x, y + r / 2, r / 8, 0, Math.PI * 2, false, x, y);
        topSmall.getStyle().setFillStyle("white");
        this.x = x;
        this.y = y;
        this.r = r;
        this.rotateSpeed = janvas.Utils.randSign() * Math.PI / 2000 * 16.67 * 42 / r;
        this.cp = new janvas.Point();
        this.outer = outer;
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.topSmall = topSmall;
        this.bottomSmall = bottomSmall;
        this.grd = { // 颜色渐变的对象
          rgb: new janvas.Rgb(0, 0, 0),
          outerStart: new janvas.Rgb(255, 255, 255).sRgbInverseCompanding(),
          black: new janvas.Rgb(0, 0, 0).sRgbInverseCompanding(),
          white: new janvas.Rgb(255, 255, 255).sRgbInverseCompanding(),
          lambda: 0,
          lambdaMax: Math.ceil(1000 / 16.67)
        };
      }

      Taichi.prototype = {
        init: function (x, y) {
          this.x = x;
          this.y = y;
          this.outer.initXY(x, y);
          this.left.init(x, y, x, y);
          this.right.init(x, y, x, y);
          this.top.init(x, y - this.r / 2, x, y);
          this.bottom.init(x, y + this.r / 2, x, y);
          this.topSmall.init(x, y - this.r / 2, x, y);
          this.bottomSmall.init(x, y + this.r / 2, x, y);
        },
        update: function () {
          this.rotate();
          if (!this.gradient()) this.update = this._update;
        },
        _update: function () {
          this.rotate();
        },
        draw: function () {
          this.outer.stroke();
          this.left.fill();
          this.right.fill();
          this.top.fill();
          this.bottom.fill();
          this.topSmall.fill();
          this.bottomSmall.fill();
        },
        rotate: function () {
          var angle = this.left.getMatrix().getAngle() + this.rotateSpeed;
          this.left.getMatrix().setAngle(angle);
          this.right.getMatrix().setAngle(angle);
          this.top.getMatrix().setAngle(angle);
          this.bottom.getMatrix().setAngle(angle);
          this.topSmall.getMatrix().setAngle(angle);
          this.bottomSmall.getMatrix().setAngle(angle);
        },
        gradient: function () {
          var grd = this.grd;
          if (grd.lambda < grd.lambdaMax) {
            var lambda = grd.lambda / grd.lambdaMax;
            this.outer.getStyle().setStrokeStyle(
              grd.rgb.sRgbMarksGammaMixing(grd.outerStart, grd.black, lambda)
                .sRgbCompanding().toRgbString()
            );
            this._grd(this.left, grd.white, grd.black, lambda);
            this.top.getStyle().setFillStyle(this.left.getStyle().getFillStyle());
            this.bottomSmall.getStyle().setFillStyle(this.left.getStyle().getFillStyle());
            this._grd(this.right, grd.black, grd.white, lambda);
            this.bottom.getStyle().setFillStyle(this.right.getStyle().getFillStyle());
            this.topSmall.getStyle().setFillStyle(this.right.getStyle().getFillStyle());
            grd.lambda++;
            return true;
          } else {
            this.outer.getStyle().setStrokeStyle(janvas.FillStrokeStyle.DEFAULT_STROKE_STYLE);
            this.left.getStyle().setFillStyle(janvas.FillStrokeStyle.DEFAULT_FILL_STYLE);
            this.top.getStyle().setFillStyle(janvas.FillStrokeStyle.DEFAULT_FILL_STYLE);
            this.bottomSmall.getStyle().setFillStyle(janvas.FillStrokeStyle.DEFAULT_FILL_STYLE);
            this.right.getStyle().setFillStyle("white");
            this.bottom.getStyle().setFillStyle("white");
            this.topSmall.getStyle().setFillStyle("white");
            return false;
          }
        },
        _grd: function (obj, start, end, lambda) {
          obj.getStyle().setFillStyle(
            this.grd.rgb.sRgbMarksGammaMixing(start, end, lambda)
              .sRgbCompanding().toRgbString()
          );
        },
        collide: function (taichi) {
          var x1 = this.x, y1 = this.y, r1 = this.r * 17 / 16, // 添加了 outer linewidth 的一半
            x2 = taichi.x, y2 = taichi.y, r2 = taichi.r * 17 / 16,
            cp1 = this.cp, cp2 = taichi.cp, r = Math.min(r1, r2); // collision point
          if (janvas.Collision.arc(x1, y1, r1, x2, y2, r2)) {
            cp1.init(x1, y1).subtract(cp2.init(x2, y2)).unit().scale(r, r);
            if (isNaN(cp1.x)) {
              Math.random() > 0.5 ? cp1.init(r, 0) : cp1.init(0, r);
            }
            this.init(x1 + cp1.x / r1, y1 + cp1.y / r1);
            cp1.inverse();
            taichi.init(x2 + cp1.x / r2, y2 + cp1.y / r2);
          }
        },
        inRect: function (rect) {
          return janvas.Collision.arcRect(this.x, this.y, this.r,
            rect.getStartX(), rect.getStartY(), rect.getWidth(), rect.getHeight());
        }
      };

      return {
        createTaichi: function (x, y, r) {
          return new Taichi(this.$ctx, x, y, r);
        }
      };
    }())
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
      this.$raf.start();
    },
    update: function (ts) {
      if (ts > this.addCount * 1000) {
        this.addCount++;
        this.add();
      }
      var flag = false;
      this.taichi.forEach(function (tc1) {
        tc1.update();
        this.taichi.forEach(function (tc2) {
          if (tc1 === tc2) return;
          tc1.collide(tc2);
        });
        tc1.in = tc1.inRect(this.background);
        if (!tc1.in) flag = true;
      }, this);
      if (flag) this.taichi = this.taichi.filter(function (tc) {
        return tc.in;
      });
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.taichi.forEach(function (tc) {
        tc.draw();
      });
    }
  },
  events: {
    mousedown: function (ev) {
      this.add(ev.$x, ev.$y);
    },
    visibility: function (visible) {
      if (visible) this.$raf.resume();
      else this.$raf.pause();
    },
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
    }
  },
  functions: {
    add: function (x, y) {
      this.taichi.push(this.factory.createTaichi(
        x || janvas.Utils.randInt(0, this.$width),
        y || janvas.Utils.randInt(0, this.$height),
        janvas.Utils.randInt(20, 100)
      ));
    }
  }
});
}

function tiger(container) {
  return new janvas.Canvas({
  container: container,
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
      this.shapes = [];
    },
    data: function (svgXML) {
      var paths = new DOMParser().parseFromString(svgXML, "text/xml").getElementsByTagName("path"),
        path, shape, fill, stroke, lineWidth, style;
      for (var i = 0; i < paths.length; i++) {
        path = paths[i];
        shape = new janvas.FixedShape(this.$ctx, 0, 0, path.getAttribute("d"));
        fill = path.getAttribute("fill");
        stroke = path.getAttribute("stroke");
        lineWidth = parseFloat(path.getAttribute("stroke-width"));
        style = shape.getStyle();
        this.svgStyle2shape(style, "fillStyle", fill);
        this.svgStyle2shape(style, "strokeStyle", stroke);
        if (fill === null && stroke === null) {
          style.setFillStyle(janvas.FillStrokeStyle.DEFAULT_FILL_STYLE)
            .setStrokeStyle(janvas.FillStrokeStyle.DEFAULT_STROKE_STYLE);
        }
        style.setLineWidth(isNaN(lineWidth) ? 1 : lineWidth);
        style.lineWidthCache = style.getLineWidth();
        this.shapes.push(shape);
      }
      this.draw();
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.shapes.forEach(function (shape) {
        shape.fillStroke();
      });
    }
  },
  events: {
    mousedown: function () {
      this._mousedown = true;
      this.shapes.forEach(function (shape) {
        shape.lastX = shape.getStartX();
        shape.lastY = shape.getStartY();
      });
    },
    mousemove: function (ev) {
      if (this._mousedown) {
        this.shapes.forEach(function (shape) {
          var mx = shape.lastX + ev.$moveX, my = shape.lastY + ev.$moveY;
          shape.init(mx, my, mx, my);
        });
      } else {
        this.shapes.forEach(function (shape) {
          shape.getStyle().setLineWidth(
            shape.isPointInPath(ev.$x, ev.$y)
              ? 10 : shape.getStyle().lineWidthCache
          );
        });
      }
      this.draw();
    },
    mouseup: function () {
      this._mousedown = false;
    },
    wheel: function (ev) {
      this.shapes.forEach(function (shape) {
        var targetSx = ev.$x + (shape.getCenterX() - ev.$x) * ev.$scaling,
          targetSy = ev.$y + (shape.getCenterY() - ev.$y) * ev.$scaling;
        shape.init(targetSx, targetSy, targetSx, targetSy)
          .getMatrix().setScale(ev.$scale, ev.$scale);
      });
      this.draw();
    }
  },
  functions: {
    svgStyle2shape: function (style, type, color) {
      if (color !== null)
        if (color !== "none") style[type] = color;
        else style[type] = "#00000000";
      else style[type] = "#00000000";
    }
  }
});
}

function clock(container) {
  return new janvas.Canvas({
  container: container,
  methods: {
    init: function () {
      var bezier = new janvas.Bezier(this.$ctx, 0, 0, [0, 0, 100, 1457, 200, -460, 300, 989, 400, 405, 500, 500]);
      bezier.getMatrix().setScale(1 / 500, 1 / 500);
      this.animation = bezier.setTransform().getTransformedPoints().filter(function () {
        return arguments[1] % 2 === 1;
      });
      this.background = new janvas.Rect(this.$ctx); // 背景
      this.bottom = new janvas.RoundRect(this.$ctx); // 时钟底
      this.bottom.border = new janvas.RoundRect(this.$ctx);
      this.outer = new janvas.Arc(this.$ctx); // 主圆
      this.outer.border = new janvas.Arc(this.$ctx); // 主圆阴影
      this.second = new janvas.RoundRect(this.$ctx);
      this.minute = new janvas.RoundRect(this.$ctx);
      this.hour = new janvas.RoundRect(this.$ctx);
      this.dot = new janvas.Arc(this.$ctx);
      this.initStyles();
    },
    initStyles: function () {
      this.shadow = new janvas.ShadowStyle().setShadowColor("hsla(0, 0%, 0%, 0.8)");
      this.shadow.basis = new janvas.Point(0, 0);
      this.shadow.cursor = new janvas.Point(0, 0);
      this.background.getStyle().setFillStyle("hsl(0, 0%, 63%)"); // 背景
      this.bottom.shadow = new janvas.ShadowStyle().setShadowColor("hsla(0, 0%, 0%, 0.5)");
      this.outer.shadow = new janvas.ShadowStyle().setShadowColor("hsla(0, 0%, 0%, 0.5)");
      this.dot.getStyle().setStrokeStyle("hsl(0, 0%, 63%)");
    },
    resizeStyles: function () {
      var min = Math.min(this.$width, this.$height);
      this.shadow.setShadowBlur(min / 140);
      this.shadow.basis.init(min / 35, 0);
      this.gradient("hsl(0, 0%, 100%)", "hsl(0, 0%, 90%)",
        this.bottom, this.hour, this.minute, this.dot);
      this.bottom.border.getStyle().setLineWidth(min / 35);
      this.bottom.shadow.setShadowBlur(min / 140 * 3).setShadowOffsetX(-this.$width);
      this.gradient("hsl(0, 0%, 40%)", "hsl(0, 0%, 23%)", this.outer);
      this.outer.border.getStyle().setLineWidth(min / 35);
      this.outer.shadow.setShadowBlur(min / 70).setShadowOffsetX(-this.$width);
      this.gradient("hsl(0, 80%, 70%)", "hsl(0, 80%, 50%)", this.second);
    },
    update: function (ts) {
      ts += this.milliseconds;
      if (ts > this._secondIncrement * 1000) {
        this._secondIncrement++;
        if (++this.seconds % 60 === 0) {
          this.seconds = 0;
          if (++this.minutes % 60 === 0) {
            this.minutes = 0;
            if (++this.hours % 24 === 0) this.hours = 0;
          }
        }
        this._allSeconds++; // 维护一个总秒数，避免重复操作 hours/minutes/seconds
        this.setAngle();
        this.onEvent(this.hours, this.minutes, this.seconds);
      } else if (ts % 1000 > 600) { // 动画间隔为 400，动画效果为五阶贝塞尔曲线
        this.second.getMatrix().setAngle(this._secondLastAngle
          + Math.PI / 30 // secondIncrementAngle: 1/60*2PI
          * this.animation[Math.floor((ts % 1000 - 600) / 400 * this.animation.length)]);
      }
    },
    draw: function () {
      this.background.fill();
      this.$cfg.setShadowStyles(this.shadow);
      this.bottom.fill();
      this.$cfg.setShadowStyles(this.bottom.shadow);
      this.bottom.clip().border.stroke().restore();
      this.$cfg.resetShadowStyles();
      this.outer.fill();
      this.$cfg.setShadowStyles(this.outer.shadow);
      this.outer.border.stroke();
      this.$cfg.setShadowStyles(this.shadow);
      this.hour.fill();
      this.minute.fill();
      this.second.fill();
      this.dot.fill();
      this.$cfg.resetShadowStyles();
      this.dot.stroke();
    }
  },
  events: {
    resize: function () {
      var goldenRatio = 0.809,
        size = Math.min(this.$width, this.$height) * goldenRatio,
        cx = this.$width / 2, cy = this.$height / 2;
      this._sizeBy2 = size / 2;
      this.background.initXY(0, 0).setWidth(this.$width).setHeight(this.$height);
      this.bottom.init(cx - this._sizeBy2, cy - this._sizeBy2, cx, cy)
        .setWidth(size).setHeight(size).setRadius(size / 4);
      this.bottom.border.initXY(this.bottom.getStartX() + this.$width, this.bottom.getStartY())
        .setWidth(size).setHeight(size).setRadius(size / 4);
      this.outer.initXY(cx, cy).setRadius(size * goldenRatio / 2);
      this.outer.border.initXY(cx + this.$width, cy).setRadius(this.outer.getRadius());
      var offset = this.outer.getRadius() * Math.pow(goldenRatio, 18);
      this.second.init(cx - offset * 8, cy - offset, cx, cy)
        .setWidth(this.outer.getRadius() * goldenRatio + offset * 8)
        .setHeight(offset * 2).setRadius(offset);
      offset /= Math.pow(goldenRatio, 2);
      this.minute.init(cx - offset, cy - offset, cx, cy)
        .setWidth(this.outer.getRadius() * Math.pow(goldenRatio, 2) + offset)
        .setHeight(offset * 2).setRadius(offset);
      offset /= Math.pow(goldenRatio, 2);
      this.hour.init(cx - offset, cy - offset, cx, cy)
        .setWidth(this.outer.getRadius() * Math.pow(goldenRatio, 4) + offset)
        .setHeight(offset * 2).setRadius(offset);
      this.dot.initXY(cx, cy).setRadius(offset / Math.pow(goldenRatio, 2));
      this.resizeStyles();
    },
    visibility: function (visible) {
      if (visible) {
        this.resetTime();
        this.$raf.start();
      } else {
        this.$raf.stop();
      }
    },
    onEvent: janvas.Utils.noop
  },
  functions: {
    gradient: function (start, stop) {
      var grd = janvas.Utils.createLinearGradient(-this._sizeBy2, -this._sizeBy2,
        this._sizeBy2, this._sizeBy2, arguments[2]);
      grd.addColorStop(0, start);
      grd.addColorStop(1, stop);
      for (var i = 2; i < arguments.length; i++) arguments[i].getStyle().setFillStyle(grd);
    },
    resetTime: function () {
      var date = new Date();
      this.hours = date.getHours();
      this.minutes = date.getMinutes();
      this.seconds = date.getSeconds();
      this.milliseconds = date.getMilliseconds();
      this._allSeconds = this.hours * 3600 + this.minutes * 60 + this.seconds;
      this._secondIncrement = 1;
      this.setAngle();
    },
    setAngle: function () {
      this.hour.getMatrix().setAngle(this._allSeconds / 3600 / 12 * Math.PI * 2 - Math.PI / 2);
      this.minute.getMatrix().setAngle(this._allSeconds / 60 / 60 * Math.PI * 2 - Math.PI / 2);
      this.second.getMatrix().setAngle(this._allSeconds / 60 * Math.PI * 2 - Math.PI / 2);
      this._secondLastAngle = this.second.getMatrix().getAngle();
      // if (this.hours === 5) {
      //   if (this.minutes >= 45) this.shadow.cursor.copy(this.shadow.basis).scaleX(this._allSeconds % 900 / 900);
      // } else
      //   if (this.hours >= 6 && this.hours < 18) { // 设置 shadow 随时间变化的“角度”
      this.shadow.cursor.copy(this.shadow.basis).rotate((this._allSeconds - 6 * 3600) % 43200 / (12 * 3600) * Math.PI);
      // }
      // else if (this.hours === 18) {
      // if (this.minutes < 15) this.shadow.cursor.copy(this.shadow.basis).inverseX().scaleX(1 - this._allSeconds % 900 / 900);
      // }
      this.shadow.setShadowOffsetX(this.shadow.cursor.getX()).setShadowOffsetY(this.shadow.cursor.getY());
    }
  }
});
clock.onEvent = function (hours, minutes, seconds) {
  console.log(pad(hours) + ":" + pad(minutes) + ":" + pad(seconds));

  function pad(num) {
    return num < 10 ? "0" + num : "" + num
  }
};
}

function beziermaker(container) {
  return new janvas.Canvas({
  container: container,
  interval: 16,
  times: -1,
  props: {
    position: 0, // 指示器运行位置
    size: Math.floor(10000 / 16), // 10000ms/16ms，10秒运行次数
    keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Delete", "Enter", "w", "s", "a", "d", "q", "e"]
  },
  components: {
    factory: (function () {
      function Dot(ctx, x, y, index) {
        this._index = index;
        this._r = 5;
        this.arc = new janvas.Arc(ctx, 0, 0, this._r);
        this.text = new janvas.Text(ctx);
        this.initXY(x, y);
        this.initStyles();
        this.highlight(true);
      }

      Dot.prototype = {
        initXY: function (x, y) {
          this._x = x;
          this._y = y;
          this.arc.initXY(x, y);
          this.text.initXY(x + this._r * 2, y).setText(this.getReadableText());
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
          this.initXY(this._lastX + moveX, this._lastY + moveY);
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
        newDot: function (x, y) {
          return new Dot(this.$ctx, x, y, this._index++);
        },
        decreaseAutoIndex: function () {
          this._index--;
        }
      };
    }())
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
      this.dots = [];
      this.polyline = new janvas.Polyline(this.$ctx, 0, 0, []);
      this.bezier = new janvas.Bezier(this.$ctx, 0, 0, this.polyline.getPoints(), this.size * 2);
      this.bezier.getStyle().setStrokeStyle("hsl(0, 80%, 50%)");
      this.transformedPoints = this.bezier.getTransformedPoints();
      this.hint = new janvas.Text(this.$ctx, 0, 0, "");
      this.hint.getStyle().setFillStyle("rgba(0, 0, 0, 0.5)")
        .setFont("12px sans-serif").setTextAlign("end").setTextBaseline("middle");
      this.cursor = new janvas.ArrowHead(this.$ctx, 0, 0);
      this.cursor.getStyle().setFillStyle("hsl(270, 80%, 50%)");
      this.$raf.start();
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
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
      if (!this.$raf.isRunning()) return;
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
          this.dots.push(this.locked = this.current = this.factory.newDot(ev.$x, ev.$y));
          this.polyline.insert(ev.$x, ev.$y);
        }
        this.locked.mark();
      }
    },
    mousemove: function (ev) {
      if (!this.$raf.isRunning()) return;
      if (ev.buttons === 2) { // 鼠标右键
        this.dots.forEach(function (dot) {
          dot.onmove(ev.$moveX, ev.$moveY);
          this.polyline.update(dot.getX(), dot.getY(), dot.getIndex());
        }, this);
      } else if (ev.buttons === 1) { // 鼠标左键
        this.locked.onmove(ev.$moveX, ev.$moveY);
        this.polyline.update(this.locked.getX(), this.locked.getY(), this.locked.getIndex());
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
      this.hint.initXY(ev.$x, ev.$y).setText("(" + ev.$x + "," + ev.$y + ")");
    },
    mouseup: function () {
      if (!this.$raf.isRunning()) this.$raf.resume();
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
          this.locked.initXY(this.locked.getX(), this.locked.getY() - increase);
          this.polyline.update(this.locked.getX(), this.locked.getY(), this.locked.getIndex());
          break;
        case "ArrowDown":
        case "s":
          this.locked.initXY(this.locked.getX(), this.locked.getY() + increase);
          this.polyline.update(this.locked.getX(), this.locked.getY(), this.locked.getIndex());
          break;
        case "ArrowLeft":
        case "a":
          this.locked.initXY(this.locked.getX() - increase, this.locked.getY());
          this.polyline.update(this.locked.getX(), this.locked.getY(), this.locked.getIndex());
          break;
        case "ArrowRight":
        case "d":
          this.locked.initXY(this.locked.getX() + increase, this.locked.getY());
          this.polyline.update(this.locked.getX(), this.locked.getY(), this.locked.getIndex());
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
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
    },
    autoResize: function (flag) {
      this._autoResize = flag;
    },
    blur: function () {
      this.$raf.pause();
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
      this.cursor.initXY(x1, y1).setAngle(Math.atan2(y1 - y2, x1 - x2));
    }
  }
});
bezierMaker.autoResize(true);
}

function flydots(container) {
  return new janvas.Canvas({
  container: container,
  interval: 16,
  times: -1,
  props: {
    dots: [],
    lines: []
  },
  components: {
    factory: (function () {
      function Dot(ctx, width, height) {
        this.setBounding(width, height);
        this._x = janvas.Utils.randInt(this._left, this._right, true);
        this._y = janvas.Utils.randInt(this._top, this._bottom, true);
        this._r = 3;
        this._lvx = this._vx = janvas.Utils.randSign() * janvas.Utils.randInt(10, 100, true) / 100;
        this._lvy = this._vy = janvas.Utils.randSign() * janvas.Utils.randInt(10, 100, true) / 100;
        this._relateStart = [];
        this._relateEnd = [];
        this.arc = new janvas.Arc(ctx, this._x, this._y, this._r);
        this.arc.getStyle().setFillStyle("hsl(0, 0%, 40%)");
      }

      Dot.prototype = {
        initXY: function (x, y) {
          this._x = x;
          this._y = y;
          this.arc.initXY(x, y);
          this._relateStart.forEach(this.startCallback, this);
          this._relateEnd.forEach(this.endCallBack, this);
        },
        closer: function (x, y) {
          this._vx = (x - this._x) / Math.abs(x - this._x);
          this._vy = (y - this._y) / Math.abs(y - this._y);
        },
        restore: function () {
          this._vx = this._lvx;
          this._vy = this._lvy;
        },
        relateStart: function (line) {
          this._relateStart.push(line);
        },
        relateEnd: function (line) {
          this._relateEnd.push(line);
        },
        startCallback: function (line) {
          line.initXY(this._x, this._y);
        },
        endCallBack: function (line) {
          line.setEndX(this._x).setEndY(this._y);
        },
        setBounding: function (width, height) {
          this._left = this._top = -50;
          this._right = width + 50;
          this._bottom = height + 50;
        },
        update: function () {
          this._x += this._vx;
          this._y += this._vy;
          this.initXY(this._x, this._y);
          if (this._x < this._left || this._x > this._right) this._vx *= -1;
          if (this._y < this._top || this._y > this._bottom) this._vy *= -1;
        },
        draw: function () {
          this.arc.fill();
        }
      };

      function Line(ctx, source, target) {
        this.line = new janvas.Line(ctx);
        source.relateStart(this.line);
        target.relateEnd(this.line);
        this._rgb = new janvas.Rgb(0, 0, 0, 0);
      }

      Line.prototype = {
        update: function () {
          var _lambda = 255 - janvas.Utils.pythagorean(
            this.line.getStartX() - this.line.getEndX(),
            this.line.getStartY() - this.line.getEndY()) / 100 * 255;
          this._lambda = _lambda < 0 ? 0 : _lambda;
          this.line.getStyle().setStrokeStyle(this._rgb.setAlpha(this._lambda).toRgbString(true));
        },
        draw: function () {
          if (this._lambda) this.line.stroke();
        }
      };

      return {
        newDot: function (width, height) {
          return new Dot(this.$ctx, width, height);
        },
        newLine: function (source, target) {
          return new Line(this.$ctx, source, target);
        }
      };
    }())
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      for (var i = 0; i < 100; i++) {
        var dot = this.factory.newDot(this.$width, this.$height);
        this.dots.forEach(function (target) {
          this.lines.push(this.factory.newLine(dot, target));
        }, this);
        this.dots.push(dot);
      }
      this.cursor = this.factory.newDot();
      this.dots.forEach(function (target) {
        this.lines.push(this.factory.newLine(this.cursor, target));
      }, this);
      this.$raf.start();
    },
    update: function () {
      this.dots.forEach(function (dot) {
        dot.update();
      }, this);
      this.lines.forEach(function (line) {
        line.update();
      });
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.lines.forEach(function (line) {
        line.draw();
      });
      this.dots.forEach(function (dot) {
        dot.draw();
      });
    }
  },
  events: {
    mousedown: function (ev) {
      this.dots.forEach(function (dot) {
        dot.closer(ev.$x, ev.$y);
      }, this);
    },
    mousemove: function (ev) {
      this.cursor.initXY(ev.$x, ev.$y);
    },
    mouseup: function () {
      this.dots.forEach(function (dot) {
        dot.restore();
      });
    },
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
      this.dots.forEach(function (dot) {
        dot.setBounding(this.$width, this.$height);
      }, this);
    }
  }
});
}

function aboutwheel(container) {
  return new janvas.Canvas({
  container: container,
  interval: 16,
  times: -1,
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
      this.$raf.start();
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
      this.img.lastCx = this.img.getCenterX();
      this.img.lastCy = this.img.getCenterY();
      this.img.targetCx = ev.$x + (this.img.getCenterX() - ev.$x) * ev.$scaling;
      this.img.targetCy = ev.$y + (this.img.getCenterY() - ev.$y) * ev.$scaling;
      this.img.lastScale = this.img.getMatrix().getScaleX();
      this.img.targetScale = ev.$scale;
      this.img.count = 0;
      this.img.maxCount = Math.floor(300 / this.$interval);
    }
  },
  functions: {
    scaleAnimation: function () {
      if (this.img.count <= this.img.maxCount) {
        var lambda = this.img.count / this.img.maxCount,
          stampCx = this.img.lastCx + (this.img.targetCx - this.img.lastCx) * lambda,
          stampCy = this.img.lastCy + (this.img.targetCy - this.img.lastCy) * lambda,
          scale = this.img.lastScale + (this.img.targetScale - this.img.lastScale) * lambda;
        this.img.init(stampCx - this.size, stampCy - this.size, stampCx, stampCy)
          .getMatrix().setScale(scale, scale);
        this.img.count++;
      }
    }
  }
});
}

function aboutedge(container) {
  return new janvas.Canvas({
  container: container,
  props: {
    points: [],
    current: void (0)
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
      this.start = new janvas.Arc(this.$ctx, 200, 250, 5);
      this.start.getStyle().setFillStyle("hsl(0, 80%, 60%)");
      this.end = new janvas.Arc(this.$ctx, 500, 250, 5);
      this.end.getStyle().setFillStyle("hsl(90, 80%, 60%)");
      this.an = new janvas.Arc(this.$ctx, 525, 300, 5);
      this.an.getStyle().setFillStyle("hsl(180, 80%, 60%)");
      this.points.push(this.start, this.end, this.an);
      this.edge = new janvas.Edge(this.$ctx);
      this.text = new janvas.Text(this.$ctx, 0, 0, "Janvas");
      this.text.getStyle().setFont("12px sans-serif").setTextAlign("center")
        .setTextBaseline("middle");
      this.edge.setEmptyLength(janvas.Utils.measureTextWidth(this.text.getText(),
        this.text.getStyle().getFont()) / 0.809);
      this.head = new janvas.ArrowHead(this.$ctx).setArrowLength(12);
      this.head.getStyle().setFillStyle("hsl(270, 80%, 60%)");
      this.setCurvePropsAndDraw();
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.edge.stroke();
      if (this.edge.lambdaInRange()) {
        var an = this.edge.getLineAngle();
        this.text.getMatrix().setAngle(an > -Math.PI / 2 && an < Math.PI / 2 ? an : an + Math.PI);
        this.text.init(this.edge.getTargetX(), this.edge.getTargetY(),
          this.edge.getTargetX(), this.edge.getTargetY()).fill();
      }
      this.start.fill();
      this.end.fill();
      this.an.fill();
      this.head.setAngle(this.edge.getAngle()).fill();
    }
  },
  events: {
    mousedown: function () {
      this._mousedown = true;
      this.points.forEach(function (point) {
        point.lastX = point.getStartX();
        point.lastY = point.getStartY();
      });
    },
    mousemove: function (ev) {
      if (this._mousedown) {
        if (ev.buttons === 2) {
          this.points.forEach(function (point) {
            point.initXY(point.lastX + ev.$moveX, point.lastY + ev.$moveY);
          }, this);
          this.setCurvePropsAndDraw();
        } else {
          if (!this.current) return;
          this.current.initXY(this.current.lastX + ev.$moveX,
            this.current.lastY + ev.$moveY);
          this.setCurvePropsAndDraw();
        }
      } else {
        this.current = void (0);
        this.points.forEach(function (point) {
          if (point.isPointInPath(ev.$x, ev.$y)) {
            this.current = point;
            this.setCursor("pointer");
          }
        }, this);
        if (!this.current) this.setCursor("");
      }
    },
    mouseup: function () {
      this._mousedown = false;
    }
  },
  functions: {
    setCurvePropsAndDraw: function () {
      this.edge.initXY(this.start.getStartX(), this.start.getStartY())
        .setEndX(this.end.getStartX()).setEndY(this.end.getStartY())
        .setAngleX(this.an.getStartX()).setAngleY(this.an.getStartY());
      this.head.initXY(this.end.getStartX(), this.end.getStartY());
      this.draw();
    },
    setCursor: function (cursor) {
      if (this.$canvas.style.cursor !== cursor) this.$canvas.style.cursor = cursor;
    }
  }
});
}
return {
coordinate: coordinate,
antv: antv,
taichi: taichi,
tiger: tiger,
clock: clock,
beziermaker: beziermaker,
flydots: flydots,
aboutwheel: aboutwheel,
aboutedge: aboutedge
}}));
