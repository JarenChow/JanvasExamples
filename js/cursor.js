var cursor = new janvas.Canvas({
  container: "#app",
  props: { // URL, default, auto, initial, context-menu
    data: ["alias", "help", "copy", "progress", "wait", "crosshair", "no-drop", "not-allowed", "text", "vertical-text", "col-resize", "row-resize", "zoom-in", "zoom-out", "move", "all-scroll", "pointer", "grab", "grabbing", "cell", "n-resize", "s-resize", "ns-resize", "e-resize", "w-resize", "ew-resize", "ne-resize", "sw-resize", "nesw-resize", "nw-resize", "se-resize", "nwse-resize", "inherit", "revert", "unset", "none"]
  },
  components: {
    Button: (function () {
      function Button(ctx, raf, text) {
        janvas.Animation.call(this, raf, 1000);
        this.rect = new janvas.Rect(ctx, 0, 0, 0, 0);
        this.text = new janvas.Text(ctx, 0, 0, text);
        this.rect.getStyle().setFillStyle("pink").setLineWidth(2);
        this.text.getStyle().setFillStyle("white").setFont("24px sans-serif")
          .setTextAlign("center").setTextBaseline("middle");
        this.mousein = false;
      }

      janvas.Utils.inheritPrototype(Button, janvas.Animation);

      Button.prototype.draw = function () {
        this.mousein ? this.rect.fillStroke() : this.rect.fill();
        this.text.fill();
      };
      Button.prototype.resize = function (x, y, size) {
        var cx = x + size / 2, cy = y + size / 2;
        this.rect.init(x, y, cx, cy).setWidth(size).setHeight(size);
        this.text.init(cx, cy, cx, cy);
      };
      Button.prototype.setColor = function (color) {
        this.rect.getStyle().setFillStyle(color);
      };
      Button.prototype.getText = function () {
        return this.text.getText();
      };
      Button.prototype.setFont = function (font) {
        this.text.getStyle().setFont(font);
      };
      Button.prototype.onUpdate = function (ratio) {
        ratio = 0.236 * janvas.Utils.ease.out.elastic(ratio);
        this.rect.getMatrix().setScale(1 + ratio, 1 + ratio);
        this.text.getMatrix().setScale(1 + ratio, 1 + ratio);
      };
      Button.prototype.eventmove = function (x, y) {
        if (this.rect.isPointInPath(x, y)) {
          if (!this.mousein) {
            if (this.isRunning()) this.reverse();
            else this.start();
            return this.mousein = true;
          }
        } else if (this.mousein) {
          this.reverse();
          this.mousein = false;
        }
      };

      return Button;
    }())
  },
  methods: {
    init: function () {
      var params = this.params = {};
      params.center = new janvas.Point();
      params.start = new janvas.Point();
      params.hsl = new janvas.Hsl(0, 71, 62);
      var buttons = this.buttons = new Array(length), i;
      for (i = 0; i < this.data.length; i++) {
        buttons[i] = new this.Button(this.$ctx, this.$raf, this.data[i]);
      }
    },
    resize: function () {
      var w = this.$width, h = this.$height, params = this.params;
      params.center.init(w, h).scale(0.5, 0.5);
      params.size = Math.min(w, h) * 0.809;
      params.start.init(-params.size / 2, -params.size / 2).add(params.center);
      params.start.init(Math.floor(params.start.x), Math.floor(params.start.y));
      params.count = Math.ceil(Math.sqrt(this.data.length));
      params.gridSize = Math.floor(params.size / params.count);
      var min = Infinity, fontFamily = "courier",
        i, button, fontSize;
      for (i = 0; i < this.buttons.length; i++) {
        button = this.buttons[i];
        button.setColor(params.hsl.setHue(360 / (params.count - 1) * i).toHslString());
        button.resize(params.start.x + (i % params.count) * params.gridSize,
          params.start.y + Math.floor(i / params.count) * params.gridSize,
          params.gridSize);
        fontSize = janvas.Utils.measureTextFontSize(
          button.getText(), params.gridSize, fontFamily);
        min = fontSize < min ? fontSize : min;
      }
      for (i = 0; i < this.buttons.length; i++) {
        this.buttons[i].setFont("bold " + min + "px " + fontFamily);
      }
    },
    update: function (a, b) {
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].update(b);
      }
    },
    draw: function () {
      this.$clear();
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].draw();
      }
    }
  },
  events: {
    mousemove: function (ev) {
      var btns = this.buttons, btn;
      for (var i = 0; i < btns.length; i++) {
        btn = btns[i];
        if (btn.eventmove(ev.$x, ev.$y)) {
          btns.push(btns.splice(i, 1)[0]);
          this.$canvas.style.cursor = btn.getText();
          break;
        }
      }
    }
  }
});
