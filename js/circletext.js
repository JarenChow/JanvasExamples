var curvedText = new janvas.Canvas({
  container: "#app",
  duration: 2000,
  props: {
    back: void (0),
    str: "HELLOJANVAS",
    texts: [],
    length: 0,
    ease: janvas.Utils.$ease.inout.bounce
  },
  methods: {
    init: function () {
      this.back = new janvas.Rect(this.$ctx, 0, 0);
      this.back.getStyle().setFillStyle("gold");
      this.setText(this.str);
    },
    resize: function () {
      var w = this.$width, h = this.$height;
      this.back.setWidth(w).setHeight(h);
      for (var i = 0; i < this.length; i++) {
        this.texts[i].init(w / 2, h / 2 - Math.min(w, h) * 0.309, w / 2, h / 2);
      }
    },
    setText: function (textString) {
      var w = this.$width, h = this.$height;
      this.length = textString.length;
      while (this.texts.length < this.length) {
        var text = new janvas.Text(this.$ctx).init(w / 2, h / 2 - Math.min(w, h) * 0.309, w / 2, h / 2);
        text.getStyle().setFont("small-caps bold 8em courier")
          .setTextAlign("center").setTextBaseline("middle");
        this.texts.push(text);
      }
      for (var i = 0; i < this.length; i++) {
        this.texts[i].setText(textString[i]).targetAngle = 2 * Math.PI * i / this.length;
      }
      this.$raf.start();
    },
    update: function (ts) {
      for (var i = 0; i < this.length; i++) {
        var text = this.texts[i];
        text.getMatrix().setAngle(text.targetAngle * this.ease(ts / this.$duration));
      }
    },
    draw: function () {
      this.back.fill();
      for (var i = 0; i < this.length; i++) this.texts[i].fill();
    }
  },
  events: {
    keydown: function (ev) {
      if (ev.target !== document.body) return;
      var key = ev.key;
      if (key === "Backspace") this.str = this.str.substring(0, this.str.length - 1);
      else if (key.length === 1) this.str += key.toUpperCase();
      this.setText(this.str);
    }
  }
});
