var cursor = new janvas.Canvas({
  container: "#app",
  duration: 1000,
  props: {
    data: ["alias", "help", "copy", "progress", "wait", "crosshair", "no-drop",
      "not-allowed", "text", "vertical-text", "col-resize", "row-resize", "zoom-in", "zoom-out",
      "move", "all-scroll", "pointer", "grab", "grabbing", "cell", "n-resize",
      "s-resize", "ns-resize", "e-resize", "w-resize", "ew-resize", "ne-resize", "sw-resize",
      "nesw-resize", "nw-resize", "se-resize", "nwse-resize", "default", "inherit", "auto",
      "initial", "revert", "unset", "context-menu", "none"]
  },
  components: {
    Button: (function () {
      function Button(ctx, text) {
        this.rect = new janvas.Rect(ctx);
        this.rect.getStyle().setLineWidth(2);
        this.text = new janvas.Text(ctx, 0, 0, text);
        this.text.getStyle().setFillStyle("white")
          .setTextAlign("center").setTextBaseline("middle");
        this._scale = this._targetScale = 1;
      }

      Button.prototype = {
        setBackgroundColor: function (color) {
          this.rect.getStyle().setFillStyle(color);
        },
        setFont: function (font) {
          this.text.getStyle().setFont(font);
        },
        getText: function () {
          return this.text.getText();
        },
        resize: function (x, y, size) {
          var cx = x + size / 2, cy = y + size / 2;
          this.rect.init(x, y, cx, cy).setWidth(size).setHeight(size);
          this.text.init(cx, cy, cx, cy);
        },
        update: function (ratio) {
          this.setScale(1 + (this._targetScale - 1)
            * janvas.Utils.ease.out.elastic(ratio));
        },
        draw: function () {
          this._activate ? this.rect.fillStroke() : this.rect.fill();
          this.text.fill();
        },
        isPointInPath: function (x, y) {
          return this.rect.isPointInPath(x, y);
        },
        setScale: function (scale) {
          this._scale = scale;
          this.rect.getMatrix().setScale(scale, scale);
          this.text.getMatrix().setScale(scale, scale);
        },
        setTargetScale: function (scale) {
          this._activate = scale > 1;
          this._targetScale = scale;
        }
      };

      return Button;
    }())
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      this._initCalc();
      this._initButtons();
    },
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
      this._calc(this.$width, this.$height);
      this._resizeButtons();
    },
    update: function (ts) {
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].update(ts / this.$duration);
      }
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this._drawButtons();
      if (this._button) this._button.draw();
    },
    _initCalc: function () {
      var infos = {};
      infos.center = new janvas.Point();
      infos.start = new janvas.Point();
      infos.hsl = new janvas.Hsl(0, 71, 62);
      this.infos = infos;
    },
    _initButtons: function () {
      var data = this.data, length = data.length,
        buttons = new Array(length), i;
      for (i = 0; i < length; i++) {
        buttons[i] = new this.Button(this.$ctx, data[i]);
      }
      this.buttons = buttons;
    },
    _calc: function (w, h) {
      this.infos.center.init(w, h).scale(0.5, 0.5);
      this.infos.size = Math.min(w, h) * 0.809;
      this.infos.start.init(-this.infos.size / 2, -this.infos.size / 2)
        .add(this.infos.center);
      this.infos.start.init(
        this._floor(this.infos.start.x),
        this._floor(this.infos.start.y));
      this.infos.count = Math.ceil(Math.sqrt(this.data.length));
      this.infos.gridSize = this._floor(this.infos.size / this.infos.count);
    },
    _resizeButtons: function () {
      var min = Infinity, fontFamily = "courier",
        i, button, fontSize;
      for (i = 0; i < this.buttons.length; i++) {
        button = this.buttons[i];
        button.setBackgroundColor(this.infos.hsl.setHue(
          360 / (this.infos.count - 1) * i
        ).toHslString());
        button.resize(
          this.infos.start.x + (i % this.infos.count) * this.infos.gridSize,
          this.infos.start.y + Math.floor(i / this.infos.count) * this.infos.gridSize,
          this.infos.gridSize
        );
        fontSize = janvas.Utils.measureTextFontSize(
          button.getText(), this.infos.gridSize, fontFamily);
        min = fontSize < min ? fontSize : min;
      }
      for (i = 0; i < this.buttons.length; i++) {
        this.buttons[i].setFont("bold " + min + "px " + fontFamily);
      }
    },
    _drawButtons: function () {
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].draw();
      }
    },
    _floor: function (n) {
      return Math.floor(n);
    }
  },
  events: {
    mousemove: janvas.Utils.throttle(function (ev) {
      if (this._button && this._button.isPointInPath(ev.$x, ev.$y)) return;
      var buttons = this.buttons, flag = true;
      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (button.isPointInPath(ev.$x, ev.$y)) {
          if (button !== this._button) {
            if (this._button) this._button.setTargetScale(1);
            button.setTargetScale(1.236);
            this.$raf.start();
            this.$canvas.style.cursor = button.getText();
            this._button = button;
          }
          flag = false;
          break;
        }
      }
      if (flag) this.$canvas.style.cursor = "";
      this.draw();
    }, 16, true)
  }
});
