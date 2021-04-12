var stats = new janvas.Canvas({
  container: "#stats",
  duration: Infinity,
  props: {
    fpsTimespan: 1000, // fps refresh timespan, default 1000ms
    mbTimespan: 500
  },
  components: {
    factory: (function () {
      var WIDTH = 80, HEIGHT = 48,
        TEXT_X = 3, TEXT_Y = 2,
        GRAPH_X = 3, GRAPH_Y = 15,
        GRAPH_WIDTH = 74, GRAPH_HEIGHT = 30;

      var background,
        topBack, text,
        graph, graphAlpha,
        right, rightAlpha,
        image;

      function init(context) {
        var _ctx = context.$ctx, _dpr = context.$dpr;
        background = new janvas.Rect(_ctx, 0, 0, WIDTH, HEIGHT);
        topBack = new janvas.Rect(_ctx, 0, 0, WIDTH, GRAPH_Y);
        text = new janvas.Text(_ctx, TEXT_X, TEXT_Y);
        text.getStyle().setFont("bold 9px Helvetica,Arial,sans-serif").setTextBaseline("top");
        graph = new janvas.Rect(_ctx, GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
        graphAlpha = new janvas.Rect(_ctx, GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
        right = new janvas.Rect(_ctx, GRAPH_X + GRAPH_WIDTH - 1, GRAPH_Y, 1, GRAPH_HEIGHT);
        rightAlpha = new janvas.Rect(_ctx, GRAPH_X + GRAPH_WIDTH - 1, GRAPH_Y, 1, GRAPH_HEIGHT);
        image = new janvas.Image(_ctx, GRAPH_X, GRAPH_Y, context.$canvas, 0, 0,
          GRAPH_WIDTH - 1, GRAPH_HEIGHT,
          (GRAPH_X + 1) * _dpr, GRAPH_Y * _dpr, (GRAPH_WIDTH - 1) * _dpr, GRAPH_HEIGHT * _dpr);
      }

      function Panel(name, fg, bg) {
        this.name = name;
        this.fg = fg;
        this.bg = bg;
        this.bgAlpha = new janvas.Rgb().fromHexString(this.bg).setAlpha(230).toHexString(true);
        this.min = Infinity;
        this.max = 0;
      }

      Panel.prototype.show = function () {
        background.getStyle().setFillStyle(this.bg);
        topBack.getStyle().setFillStyle(this.bg);
        text.setText(this.name).getStyle().setFillStyle(this.fg);
        graph.getStyle().setFillStyle(this.fg);
        graphAlpha.getStyle().setFillStyle(this.bgAlpha);
        right.getStyle().setFillStyle(this.fg);
        rightAlpha.getStyle().setFillStyle(this.bgAlpha);
        background.fill();
        text.fill();
        graph.fill();
        graphAlpha.fill();
      };

      Panel.prototype.update = function (value, maxValue) {
        if (value < this.min) this.min = value;
        if (value > this.max) this.max = value;
        text.setText(Math.round(value) + " " + this.name +
          " (" + Math.round(this.min) + "-" + Math.round(this.max) + ")");
        rightAlpha.setHeight(Math.round((1 - (value / maxValue)) * GRAPH_HEIGHT));
        topBack.fill();
        text.fill();
        image.draw();
        right.fill();
        rightAlpha.fill();
      };

      return {
        init: init,
        Panel: Panel
      };
    }())
  },
  methods: {
    init: function () {
      this.factory.init(this);
      this.panels = [];
      this.addPanel("FPS", "#00ffff", "#000022");
      this.addPanel("MS", "#00ff00", "#002200");
      if (performance && performance.memory) {
        this.addPanel("MB", "#ff0088", "#220011");
      }
      this.showPanel(0);
      this.$raf.resume();
      this.$wrapper.style.cursor = "pointer";
    },
    update: function () {
      var ts = performance.now();
      if (this._ts === void (0)) return this._ts = ts;
      this.frames++;
      switch (this.panel.name) {
        case "FPS":
          if (ts >= this._ts + this.fpsTimespan) {
            this.panel.update((this.frames * 1000) / (ts - this._ts), 100);
            this._ts = ts;
            this.frames = 0;
          }
          break;
        case "MS":
          this.panel.update(ts - this._ts, 50);
          this._ts = ts;
          break;
        case "MB":
          if (ts >= this._ts + this.mbTimespan) {
            var memory = performance.memory;
            this.panel.update(memory.usedJSHeapSize / 1048576, memory.totalJSHeapSize / 1048576);
            this._ts = ts;
          }
          break;
      }
    },
    showPanel: function (mode) {
      this.panel = this.panels[this.mode = mode];
      this.panel.show();
      this.frames = 0;
      this._ts = void (0);
    },
    addPanel: function (name, fg, bg) {
      this.panels.push(new this.factory.Panel(name, fg, bg));
    },
    updatePanel: function (name, value, maxValue) {
      if (this.panel.name === name) this.panel.update(value, maxValue);
    },
    removePanel: function () {
      if (this.panels.length > 1) {
        var index = this.panels.indexOf(this.panel);
        this.panels.splice(index, 1)
        this.showPanel(index < this.panels.length ? index : index - 1);
      }
    }
  },
  events: {
    click: function () {
      this.showPanel(++this.mode % this.panels.length);
    }
  }
});
// stats.addPanel("TEST1", "#ffff88", "#222211");
// stats.addPanel("TEST2", "#ff88ff", "#221122");
// stats.showPanel(3);
// new AnimateITV(function (ts) {
//   stats.updatePanel("TEST1", 250 - Math.abs(ts / 10 - 250), 250);
// }, 5000, 100).start();

// stress test https://github.com/mrdoob/stats.js
// for (var i = 0; i < 500; i++) {
//   var div = document.createElement("div");
//   div.style.cssText="float:left;width:80px;height:48px;opacity:0.9;";
//   document.body.appendChild(div);
//   janvasexamples.stats(div);
// }
