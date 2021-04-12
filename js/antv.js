var antv = new janvas.Canvas({
  container: "#app",
  components: {
    factory: (function () {
      function Node($ctx, id, x, y, label) {
        this._defaultRadius = 1;
        this._scale = 1;
        this._showText = false;
        this.arc = new janvas.FixedArc($ctx, 0, 0, this._defaultRadius);
        this._arc = new janvas.FixedRect($ctx,
          -this._defaultRadius, -this._defaultRadius,
          this._defaultRadius * 2, this._defaultRadius * 2);
        this._arc.setMatrix(this.arc.getMatrix());
        this._arc.setStyle(this.arc.getStyle());
        this.text = new janvas.Text($ctx, 0, 0, label || id);
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
        in: function (rect) {
          return janvas.Collision.rect(
            this.x - this._defaultRadius * this._scale,
            this.y - this._defaultRadius * this._scale,
            this.x + this._defaultRadius * this._scale,
            this.y + this._defaultRadius * this._scale,
            rect.getLeft(), rect.getTop(), rect.getRight(), rect.getBottom());
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

      function Edge($ctx, source, target) {
        this._show = true;
        this.source = source;
        this.target = target;
        this.line = new janvas.Line($ctx, 0, 0, 0, 0);
        this.line.getStyle().setStrokeStyle("#333333").setLineWidth(0.1);
        this.refresh();
      }

      Edge.prototype = {
        draw: function () {
          if (this._show) this.line.stroke();
        },
        refresh: function () {
          this.line.setStart(this.source.getX(), this.source.getY())
            .setEndX(this.target.getX()).setEndY(this.target.getY());
        },
        setLineWidth: function (scale) {
          this.line.getStyle().setLineWidth(scale / 10);
        },
        show: function (flag) {
          this._show = flag;
        }
      };

      function Hint($ctx) {
        this._show = false;
        this._of = this._pdt = 3; // offset, paddingLeft, paddingTop
        this._pdl = 5;
        this.roundRect = new janvas.RoundRect($ctx, 0, 0, 0, 0, this._pdl);
        this.roundRect.getStyle().setFillStyle("white").setStrokeStyle("white")
          .setShadowBlur(20).setShadowColor("grey");
        this.text = new janvas.Text($ctx, 0, 0, "");
        this.text.getStyle().setFont("12px sans-serif").setTextBaseline("bottom");
      }

      Hint.prototype = {
        draw: function () {
          if (this._show) {
            this.roundRect.fillStroke();
            this.text.fill();
          }
        },
        setXY: function (x, y) {
          x += this._of;
          y -= this._of;
          this.text.setStart(x + this._pdl, y - this._pdt);
          this.roundRect.setStart(x, y);
        },
        setLabel: function (label) {
          if (this.label === label) return;
          this.label = label;
          this.text.setText(label);
          this.roundRect.setWidth(this.text.getActualBoundingBoxWidth() + this._pdl * 2)
            .setHeight(-(this.text.getActualBoundingBoxHeight() + this._pdt * 2));
        },
        show: function (flag) {
          this._show = flag;
        }
      };

      return {
        nodesMap: new Map(),
        newNode: function ($ctx, id, x, y, label) {
          var node = new Node($ctx, id, x, y, label);
          this.nodesMap.set(id, node);
          return node;
        },
        newEdge: function ($ctx, source, target) {
          source = this.nodesMap.get(source);
          target = this.nodesMap.get(target);
          return source && target ? new Edge($ctx, source, target) : null;
        },
        Hint: Hint
      };
    }())
  },
  methods: {
    init: function () {
      this.nodes = [];
      this.edges = [];
      this.hint = new this.factory.Hint(this.$ctx);
      this.background = new janvas.Rect(this.$ctx, 0, 0, this.$width, this.$height);
    },
    draw: function () {
      this.$clear();
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
        this.nodes.push(this.factory.newNode(this.$ctx,
          node.id, node.x, node.y, node.olabel));
      }, this);
      res.edges.forEach(function (edge) {
        edge = this.factory.newEdge(this.$ctx, edge.source, edge.target);
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
      ev.preventDefault();
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
// 原示例：https://g6.antv.vision/zh/examples/performance/perf#moreData
fetch("https://gw.alipayobjects.com/os/bmw-prod/f1565312-d537-4231-adf5-81cb1cd3a0e8.json")
  .then(function (res) {
    return res.json();
  }).then(function (res) {
  antv.data(res);
});
