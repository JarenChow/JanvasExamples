var tiger = new janvas.Canvas({
  container: "#app",
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
