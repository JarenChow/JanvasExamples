var codeRain = new janvas.Canvas({
  container: "#app",
  duration: Infinity,
  interval: 50,
  props: {
    chars: [], // can define your own string array
    fontSize: 0, // can define your own preferred font size,
    colors: {
      background: "rgb(0, 0, 0)",
      head: "rgb(255, 255, 255)",
      tail: "rgb(0, 255, 0)",
      saturRange: [60, 90], // default: [60, 90], range: 0 ~ 100
      lightRange: [30, 40], // default: [30, 40], range: 0 ~ 100
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
      this.background.getStyle().setFillStyle(this.colors.background);
      this.heads = [];
      this.pinMap = {};
      this.pinStack = [];
      this.serialIdIndex = 0;
    },
    resize: function () {
      var w = this.$width, h = this.$height;
      this.background.setWidth(w).setHeight(h);
      this.column = Math.floor(w / this.fontSize);
      this.count = Math.floor(this.column / 4);
      while (this.heads.length < this.count) {
        var x = this.getRandomX(), head = this.getDefaultText();
        head.init(x, -this.halfY, x, -this.halfY)
          .getMatrix().setOffsetY(-this.rand(h * 2));
        head.getStyle().setFillStyle(this.colors.head);
        head.timespan = this.rand(50, 100, true);
        head.timestamp = this.timestamp || 0;
        head.tails = new Array(Math.floor(head.timespan / 2) + 1);
        head.tails[0] = this.getDefaultText();
        for (var i = 1; i < head.tails.length; i++) {
          head.tails[i] = this.getDefaultText();
          head.tails[i].getStyle().setFillStyle(i < this.colors.count ?
            this.colors.gradient[i] : this.colors.tail);
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
          var tails = head.tails, last = tails[tails.length - 1];
          if (this.inBackground(last)) { // 新增 pin 以绘制拖尾效果
            var pin = this.pinStack.pop() || this.getDefaultText();
            this.setTextConfig(pin, last.getStartX(), last.getStartY(),
              last.getText(), last.getMatrix());
            pin.getStyle().setFillStyle(last.getStyle().getFillStyle());
            pin.alpha = 255;
            pin.decre = last.decre;
            this.pinMap[pin.serialId] = pin;
          }
          var mat = head.getMatrix(), y = head.getStartY() + mat.getOffsetY();
          this.setTextConfig(tails[0], head.getStartX(), y, head.getText(), mat);
          head.setText(this.getRandomChar()); // 将 head 的属性设置给 tails[0] 并变动 head
          mat.setScale(janvas.Utils.randSign(), janvas.Utils.randSign())
            .setOffsetY(mat.getOffsetY() + this.offsetY);
          for (var i = tails.length - 1; i > 0; i--) {
            var next = tails[i], prev = tails[i - 1];
            this.setTextConfig(next, prev.getStartX(), prev.getStartY(),
              Math.random() < 0.1 ? this.getRandomChar() : prev.getText(),
              prev.getMatrix()); // 将更靠近头部的前者属性设置给后者
            if (i > this.colors.count) { // 将更靠近头部的前者的颜色设置给后者
              next.getStyle().setFillStyle(prev.getStyle().getFillStyle());
              next.decre = prev.decre;
            }
          }
          var range = this.colors.lightRange[1] - this.colors.lightRange[0],
            rand = this.rand(range), tail = tails[this.colors.count];
          tail.getStyle().setFillStyle( // 随机取颜色
            this.colors.tailHsls[this.rand(this.colors.saturRange[1] -
              this.colors.saturRange[0])][rand]);
          tail.decre = rand < range / 2 ? 8 : 6; // alpha 减小幅度
          if (y >= this.$height + this.halfY) { // 当头部超出界面时
            mat.setOffsetY(0);
            var x = this.getRandomX();
            head.init(x, -this.halfY, x, -this.halfY);
          }
        }
      }, this);
    },
    draw: function () {
      this.background.fill(); // 背景绘制
      this.heads.forEach(function (head) {
        head.fill(); // 文字头部绘制
        for (var i = 1; i < head.tails.length; i++) { // 头部所带的尾巴绘制
          var tail = head.tails[i];
          if (this.inBackground(tail)) {
            tail.fill();
          }
        }
      }, this);
      for (var serialId in this.pinMap) { // 尾巴遗留处留下一个文本并渐变消失
        var pin = this.pinMap[serialId];
        if (pin.alpha > pin.decre) {
          this.$cfg.setGlobalAlpha((pin.alpha -= pin.decre) / 255); // 设置全局透明度
          pin.fill();
        } else {
          delete this.pinMap[pin.serialId];
          this.pinStack.push(pin); // 使用字典和栈回收管理这些 Text 文本
        }
      }
      this.$cfg.resetGlobalAlpha();
    },
    _initChars: function () { // 初始化字符数组
      if (this.chars.length) return;
      var i;
      for (i = 0x0030; i < 0x003A; i++) {
        this.chars.push(String.fromCharCode(i));
      }
      for (i = 0x30A0; i < 0x30FF; i++) {
        this.chars.push(String.fromCharCode(i));
      }
    },
    _initColors: function () { // 初始化颜色相关，包括随机颜色以及渐变颜色数组
      var tailRgb = new janvas.Rgb().fromRgbString(this.colors.tail),
        tailHsl = new janvas.Hsl().fromRgb(tailRgb), i, j, hsls;
      this.colors.tailHsls = [];
      for (i = this.colors.saturRange[0]; i <= this.colors.saturRange[1]; i++) {
        this.colors.tailHsls.push(hsls = []);
        for (j = this.colors.lightRange[0]; j <= this.colors.lightRange[1]; j++) {
          hsls.push(tailHsl.setSaturation(i).setLightness(j).toHslString());
        }
      }
      this.colors.gradient = new Array(this.colors.count);
      var headSRgb = new janvas.Rgb().fromRgbString(this.colors.head)
          .sRgbInverseCompanding(),
        tailSRgb = tailRgb.sRgbInverseCompanding(),
        mix = new janvas.Rgb();
      for (i = 1; i < this.colors.count; i++) {
        janvas.Rgb.sRgbGammaMixing(headSRgb, tailSRgb, i / this.colors.count, mix);
        this.colors.gradient[i] = mix.sRgbCompanding().toRgbString();
      }
    }
  },
  events: {
    visibilitychange: function (visible) {
      visible ? this.$raf.resume() : this.$raf.pause();
    }
  },
  functions: {
    rand: janvas.Utils.randInt,
    getDefaultText: function () { // 获取一个默认样式并且带 serialId 的 Text
      var text = new janvas.Text(this.$ctx, -this.halfY - 1, -this.halfY - 1, "");
      text.serialId = this.serialIdIndex++;
      text.getStyle().setFont(this.font)
        .setTextAlign("center").setTextBaseline("middle");
      return text;
    },
    getRandomChar: function () {
      return this.chars[this.rand(this.chars.length)];
    },
    getRandomX: function () { // 获取一个与所有 heads 的 startX 不同的随机 x 值
      var x;
      while ((x = this.rand(this.column) * this.fontSize + this.halfY)) {
        if (this.heads.every(function (head) {
          return x !== head.getStartX();
        })) {
          return x;
        }
      }
    },
    setTextConfig: function (tail, x, y, text, mat) { // 设置 Text 文本的一些属性
      tail.init(x, y, x, y).setText(text)
        .getMatrix().setScale(mat.getScaleX(), mat.getScaleY());
    },
    inBackground: function (tail) { // 判断 Text 是否在背景可视范围内
      var x = tail.getStartX(), y = tail.getStartY(), hy = this.halfY,
        b = this.background;
      return janvas.Collision.rect(x - hy, y - hy, x + hy, y + hy,
        b.getStartX(), b.getStartY(), b.getWidth(), b.getHeight());
    }
  }
});
