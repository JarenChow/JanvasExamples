var matrixCodeRain = new janvas.Canvas({
  container: "#app",
  interval: 50,
  props: {
    chars: [], // can define your own string array
    fontSize: 16,
    colors: {
      head: "rgb(255, 255, 255)",
      tail: "rgb(0, 255, 0)",
      saturationRange: [60, 90], // default: [60, 90], range: 0 ~ 100
      lightnessRange: [20, 40], // default: [20, 40], range: 0 ~ 100
      count: 3 // gradient count
    }
  },
  methods: {
    init: function () {
      this._initChars();
      this._initColors();
      this.fontSize = this.fontSize || Math.ceil(this.$width / 120);
      this.font = "bold " + this.fontSize + "px sans-serif";
      this.offsetY = janvas.Utils.measureTextWidth("M", this.font);
      this.halfY = this.offsetY / 2;
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      this.background.timestamp = this.timestamp = 0;
      this.heads = [];
      this.boundRect = new janvas.FixedRect(this.$ctx,
        -this.halfY, -this.halfY, this.offsetY, this.offsetY);
      this.boundRect.getStyle().setFillStyle(this.colors.back);
      this.$raf.start();
    },
    resize: function () {
      var w = this.$width, h = this.$height;
      this.background.setWidth(w).setHeight(h);
      this.background.getStyle().setFillStyle(this.colors.back);
      this.background.fill();
      this.background.getStyle().setFillStyle(this.colors.backAlpha);
      this.column = Math.floor(w / this.fontSize);
      this.count = Math.floor(this.column / 4);
      while (this.heads.length < this.count) {
        var x = this.getRandomX(), head = new janvas.Text(this.$ctx);
        head.init(x, -this.halfY, x, -this.halfY)
          .getMatrix().setOffsetY(-this.rand(h));
        this.setDefaultTextStyle(head, this.colors.head);
        head.timespan = this.rand(50, 100, true);
        head.timestamp = this.timestamp;
        head.tails = new Array(Math.floor(head.timespan / 2) + 1);
        head.tails[0] = this.getDefaultText();
        for (var i = 1; i < head.tails.length; i++) {
          head.tails[i] = this.getDefaultText();
          this.setDefaultTextStyle(head.tails[i],
            i < this.colors.count ? this.colors.gradient[i] : this.colors.tail);
        }
        this.heads.push(head);
      }
      this.heads.length = this.count;
    },
    update: function (timestamp) {
      this.timestamp = timestamp;
      this.heads.forEach(function (head) {
        if (timestamp >= head.timestamp) {
          head.timestamp += head.timespan;
          var mat = head.getMatrix(), y = head.getStartY() + mat.getOffsetY();
          this.setTail(head.tails[0], head.getStartX(), y, head.getText(), mat);
          head.setText(this.getRandomChar());
          mat.setScale(janvas.Utils.randSign(), janvas.Utils.randSign())
            .setOffsetY(mat.getOffsetY() + this.offsetY);
          for (var i = head.tails.length - 1; i > 0; i--) {
            var next = head.tails[i], prev = head.tails[i - 1];
            this.setTail(next, prev.getStartX(), prev.getStartY(),
              Math.random() < 0.05 ? this.getRandomChar() : prev.getText(), prev.getMatrix());
            if (i > this.colors.count) {
              next.getStyle().setFillStyle(prev.getStyle().getFillStyle());
            }
          }
          head.tails[this.colors.count].getStyle().setFillStyle(
            this.colors.tailHsls[this.rand(this.colors.tailHsls.length)]);
          if (y > this.$height + this.halfY) {
            mat.setOffsetY(0);
            var x = this.getRandomX();
            head.init(x, -this.halfY, x, -this.halfY);
          }
        }
      }, this);
    },
    draw: function () {
      if (this.timestamp >= this.background.timestamp) {
        this.background.fill().timestamp += 100;
      }
      this.heads.forEach(function (head) {
        head.fill();
        for (var i = 1; i < head.tails.length; i++) {
          var tail = head.tails[i];
          if (this.background.isPointInPath(tail.getStartX(), tail.getStartY())) {
            this.boundRect.getMatrix().setOffset(tail.getStartX(), tail.getStartY());
            this.boundRect.fill();
            tail.fill();
          }
        }
      }, this);
    },
    _initChars: function () {
      if (this.chars.length) return;
      var i;
      for (i = 0x0030; i < 0x003A; i++) {
        this.chars.push(String.fromCharCode(i));
      }
      for (i = 0x30A0; i < 0x30FF; i++) {
        this.chars.push(String.fromCharCode(i));
      }
    },
    _initColors: function () {
      var tailRgb = new janvas.Rgb().fromRgbString(this.colors.tail),
        tailHsl = new janvas.Hsl().fromRgb(tailRgb), i, j;
      this.colors.tailHsls = [];
      for (i = this.colors.saturationRange[0]; i <= this.colors.saturationRange[1]; i++) {
        for (j = this.colors.lightnessRange[0]; j <= this.colors.lightnessRange[1]; j++) {
          this.colors.tailHsls.push(tailHsl.setSaturation(i).setLightness(j).toHslString());
        }
      }
      this.colors.backAlpha = new janvas.Rgb().fromRgbString((this.colors.back="rgb(3, 3, 3)"))
        .setAlpha(Math.ceil(255 * (1 - 1 / (Math.pow(Math.E, Math.log(128) / 30)))))
        .toRgbString(true); // 30 次绘制后基本完成像素合成
      this.colors.gradient = new Array(this.colors.count);
      var headSRgb = new janvas.Rgb().fromRgbString(this.colors.head).sRgbInverseCompanding(),
        tailSRgb = tailRgb.sRgbInverseCompanding(), // .fromHsl(tailHsl.setSaturation(100).setLightness(50))
        mix = new janvas.Rgb();
      for (i = 1; i < this.colors.count; i++) {
        janvas.Rgb.sRgbGammaMixing(headSRgb, tailSRgb, i / this.colors.count, mix);
        this.colors.gradient[i] = mix.sRgbCompanding().toRgbString();
      }
    }
  },
  events: {
    visibility: function (visible) {
      visible ? this.$raf.resume() : this.$raf.pause();
    }
  },
  functions: {
    getDefaultText: function () {
      return new janvas.Text(this.$ctx, 0, -this.halfY, "");
    },
    setDefaultTextStyle: function (text, fillStyle) {
      text.getStyle().setFillStyle(fillStyle).setFont(this.font)
        .setTextAlign("center").setTextBaseline("middle");
    },
    rand: janvas.Utils.randInt,
    getRandomChar: function () {
      return this.chars[this.rand(this.chars.length)];
    },
    getRandomX: function () {
      var x;
      while ((x = this.rand(this.column) * this.fontSize + this.halfY)) {
        if (this.heads.every(function (head) {
          return x !== head.getStartX();
        })) {
          return x;
        }
      }
    },
    setTail: function (tail, x, y, text, mat) {
      tail.init(x, y, x, y).setText(text).getMatrix().setScale(mat.getScaleX(), mat.getScaleY());
    }
  }
});
