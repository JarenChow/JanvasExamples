var sudoku = new janvas.Canvas({
  container: "#app",
  components: {
    Grid: (function () {
      function _error(error) {
        this._error = error;
        this.getStyle().setFillStyle(error ?
          "#ed1524" : this.getStyle()._lastFillStyle);
      }

      function Grid($ctx) {
        this.rects = [];
        this.texts = [];
        this.numbers = [];
        for (var i = 0; i < 3; i++) {
          var t1 = [], t2 = [], t3 = new Array(3);
          for (var j = 0; j < 3; j++) {
            var t = new janvas.Rect($ctx);
            t.getStyle().setFillStyle("#fefefe").setStrokeStyle("#bdc4d3");
            t.i = i;
            t.j = j;
            t1.push(t);
            t = new janvas.Text($ctx, 0, 0, "");
            t.error = _error;
            t.getStyle().setTextAlign("center").setTextBaseline("middle");
            t2.push(t);
            t3[j] = 0;
          }
          this.rects.push(t1);
          this.texts.push(t2);
          this.numbers.push(t3);
        }
        this.border = new janvas.Rect($ctx);
        this.border.getStyle().setStrokeStyle("#000000");
      }

      Grid.prototype = {
        setStart: function (sx, sy) {
          var s = this._size / 3, o = s / 2;
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              var x = sx + j * s, y = sy + i * s;
              this.rects[i][j].setStart(x, y);
              this.texts[i][j].setStart(x + o, y + o);
            }
          }
          this.border.setStart(sx, sy);
        },
        resize: function (sx, sy, size) {
          this._size = size;
          var s = size / 3, o = s / 2, ff = "sans-serif",
            font = janvas.Utils.measureTextFontSize("M", s * 0.7, ff) + "px " + ff;
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              var x = sx + j * s, y = sy + i * s;
              this.rects[i][j].setStart(x, y).setWidth(s).setHeight(s)
                .getStyle().setLineWidth(Math.round(size / 120));
              this.texts[i][j].setStart(x + o, y + o)
                .getStyle().setFont(font);
            }
          }
          this.border.setStart(sx, sy).setWidth(size).setHeight(size)
            .getStyle().setLineWidth(Math.round(size / 60));
        },
        draw: function () {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              this.rects[i][j].fillStroke();
              this.texts[i][j].fill();
            }
          }
          this.border.stroke();
        },
        setNumber: function (i, j, value, input) {
          this.numbers[i][j] = value;
          this.texts[i][j].setText(value ? value + "" : "");
          this._setFillStyle(this.texts[i][j].getStyle(),
            input ? "#325aaf" : "#292a2f");
        },
        getNumber: function (i, j) {
          return this.numbers[i][j];
        },
        getText: function (i, j) {
          return this.texts[i][j];
        },
        setNumbers: function (numbers, input) {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              this.setNumber(i, j, numbers[i][j], input);
            }
          }
        },
        clear: function () {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              this.setNumber(i, j, 0);
            }
          }
        },
        isPointInPath: function (x, y) {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              if (this.rects[i][j].isPointInPath(x, y) && this._isInput(i, j)) {
                return this.rects[i][j];
              }
            }
          }
        },
        eventmove: function (x, y) {
          if (this._lastRect) this._restoreLastRect();
          outer:
            for (var i = 0; i < 3; i++) {
              for (var j = 0; j < 3; j++) {
                var rect = this.rects[i][j];
                if (rect.isPointInPath(x, y) && this._isInput(i, j)) {
                  rect.getStyle().setFillStyle("#bddbfe");
                  this._lastRect = rect;
                  break outer;
                }
              }
            }
        },
        getEventNumber: function () {
          if (this._lastRect) {
            var number = this.getNumber(this._lastRect.i, this._lastRect.j);
            this._restoreLastRect();
            return number;
          }
        },
        check: function () {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              this.texts[i][j].error(this._check(i, j, this.numbers[i][j]));
            }
          }
        },
        _check: function (i, j, number) {
          for (var k = 0; k < 3; k++) {
            for (var l = 0; l < 3; l++) {
              if (k === i && l === j) continue;
              if (this.numbers[k][l] === number) return true;
            }
          }
          return false;
        },
        isComplete: function () {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
              if (this.texts[i][j]._error || this.numbers[i][j] === 0) return false;
            }
          }
          return true;
        },
        _restoreLastRect: function () {
          this._lastRect.getStyle().setFillStyle("#fefefe");
          this._lastRect = null;
        },
        _setFillStyle: function (style, fillStyle) {
          style.setFillStyle(fillStyle)._lastFillStyle = fillStyle;
        },
        _isInput: function (i, j) {
          return this.numbers[i][j] === 0 ||
            this.texts[i][j].getStyle()._lastFillStyle === "#325aaf";
        }
      };

      return Grid;
    }())
  },
  methods: {
    init: function () {
      this.grids = [];
      for (var i = 0; i < 3; i++) {
        var t = [];
        for (var j = 0; j < 3; j++) {
          t.push(new this.Grid(this.$ctx));
        }
        this.grids.push(t);
      }
      this.selector = new this.Grid(this.$ctx);
      this.selectorNumbers = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      this.selector.setNumbers(this.selectorNumbers, true);
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      this.background.getStyle().setFillStyle("#ffffff");
      this.mainground = new janvas.Rect(this.$ctx);
      this._cache = new Array(9);
      for (i = 0; i < 9; i++) this._cache[i] = {};
    },
    resize: function () {
      var w = this.$width, h = this.$height,
        sy = Math.min(w, h) * 0.191 / 2,
        sx = Math.abs(w - h) / 2 + sy,
        t, size;
      if (w < h) {
        t = sy;
        sy = sx;
        sx = t;
      }
      size = w - sx * 2;
      this.mainground.setStart(sx, sy).setWidth(size).setHeight(size);
      this._offset = (size /= 3) / 2;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          this.grids[i][j].resize(sx + j * size, sy + i * size, size);
        }
      }
      this.selector.resize(0, 0, size);
      this.background.setWidth(w).setHeight(h);
    },
    draw: function () {
      this.background.fill();
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          this.grids[i][j].draw();
        }
      }
      if (this.selector.activate) this.selector.draw();
    },
    setNumber: function (row, column, value) {
      this.getGrid(row, column).setNumber(this.mod(row), this.mod(column), value);
      this.check();
      this.draw();
    },
    getNumber: function (row, column) {
      return this.getGrid(row, column).getNumber(this.mod(row), this.mod(column));
    },
    setNumbers: function (numbers) {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          this.grids[i][j].setNumbers(numbers[i][j]);
        }
      }
      this.check();
      this.draw();
    },
    clear: function () {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          this.grids[i][j].clear();
        }
      }
      this.draw();
    },
    inverseSelector: function () {
      var numbers = this.selectorNumbers, nums = numbers[0];
      numbers[0] = numbers[2];
      numbers[2] = nums;
      this.selector.setNumbers(numbers, true);
    },
    getNumberArray: function () {
      var numbers = new Array(81);
      for (var r = 1; r < 10; r++) {
        for (var c = 1; c < 10; c++) {
          numbers[(r - 1) * 9 + c - 1] = this.getNumber(r, c);
        }
      }
      return numbers;
    },
    setNumberArray: function (numberArray) {
      for (var i = 0; i < 81; i++) {
        this.setNumber(Math.floor(i / 9) + 1, i % 9 + 1, numberArray[i]);
      }
    },
    check: function () {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          this.grids[i][j].check();
        }
      }
      for (i = 0; i < 3; i++) {
        this._checkRow(this.grids[i][0], this.grids[i][1], this.grids[i][2]);
      }
      for (j = 0; j < 3; j++) {
        this._checkColumn(this.grids[0][j], this.grids[1][j], this.grids[2][j]);
      }
    },
    /**
     * 完整适配解决更多情况数独的源码在：
     * https://github.com/JarenChow/Sudoku
     */
    solve: function () {
      var numberArray = this.getNumberArray(),
        startTime = performance.now(),
        numbers = [],
        numbersBackup = [],
        possibleValue = [],
        possibleValueBackup = [],
        length = 81,
        width = 9,
        height = 9,
        subGridWidth = 3,
        subGridHeight = 3,
        standard = [1, 2, 3, 4, 5, 6, 7, 8, 9],
        loopCount = 0,
        maxCount = 62,
        maxCountStep = maxCount,
        operations = ["original", "asc", "desc", "random"],
        depth = -1,
        stopLoop = false,
        message = [];

      for (var index = 0; index < length; index++) {
        numbers[index] = 0;
        possibleValue[index] = standard.slice(0, width);
      }

      function updateState(index, value, type) {
        numbers[index] = value;
        possibleValue[index] = 0;
        if (type) message.push(type + " R" + (Math.floor(index / width) + 1) +
          "C" + (index % width + 1) + "=" + value);

        var row = Math.floor(index / width),
          rowIndex = row * width,
          rowEndIndex = rowIndex + width;
        for (var i = rowIndex; i < rowEndIndex; i++) {
          update(i);
        }

        var column = index % width,
          columnEndIndex = width * height;
        for (var j = column; j < columnEndIndex; j += width) {
          update(j);
        }

        var subGridRow = Math.floor(row / subGridHeight),
          subGridColumn = Math.floor(column / subGridWidth),
          subGridIndex = subGridRow * subGridHeight * width +
            subGridColumn * subGridWidth;
        for (i = 0; i < subGridHeight; i++) {
          for (j = 0; j < subGridWidth; j++) {
            update(subGridIndex + i * width + j);
          }
        }

        function update(cursor) {
          if (numbers[cursor] !== 0) return;
          var hasValue = possibleValue[cursor].indexOf(numbers[index]);
          if (hasValue > -1) {
            possibleValue[cursor].splice(hasValue, 1);
          }
        }
      }

      for (index = 0; index < length; index++) {
        var value = parseInt(numberArray[index]);
        if (value === 0) continue;
        updateState(index, value);
      }

      function nakedSingle() {
        for (var index = 0; index < length; index++) {
          if (possibleValue[index].length === 1) {
            updateState(index, possibleValue[index][0], "唯余解法");
          }
        }
      }

      function hiddenSingle() {
        var isUniqueNumber;
        for (var index = 0; index < length; index++) {
          if (numbers[index] !== 0) continue;
          var row = Math.floor(index / width),
            column = index % width;

          rowOrColumn(index, row * width, (row + 1) * width, 1);

          if (isUniqueNumber) continue;

          rowOrColumn(index, column, column + width * height, width);

          if (isUniqueNumber) continue;

          var subGridIndex = Math.floor(row / subGridHeight) * subGridHeight * width +
            Math.floor(column / subGridWidth) * subGridWidth;
          for (var i = 0; i < possibleValue[index].length; i++) {
            isUniqueNumber = true;
            UniqueFlag:
              for (var j = 0; j < subGridHeight; j++) {
                for (var k = 0; k < subGridWidth; k++) {
                  var c = subGridIndex + j * width + k;
                  if (numbers[c] !== 0 || c === index) continue;
                  if (possibleValue[c].indexOf(possibleValue[index][i]) > -1) {
                    isUniqueNumber = false;
                    break UniqueFlag;
                  }
                }
              }
            if (isUniqueNumber) {
              updateState(index, possibleValue[index][i], "宫摒除法");
            }
          }
        }

        function rowOrColumn(index, startIndex, endIndex, step) {
          for (var i = 0; i < possibleValue[index].length; i++) {
            isUniqueNumber = true;
            for (var j = startIndex; j < endIndex; j += step) {
              if (numbers[j] !== 0 || j === index) continue;
              if (possibleValue[j].indexOf(possibleValue[index][i]) > -1) {
                isUniqueNumber = false;
                break;
              }
            }
            if (isUniqueNumber) {
              updateState(index, possibleValue[index][i], (step === 1 ? "行" : "列") + "摒除法");
              break;
            }
          }
        }
      }

      function loopSolveSudoku() {
        while (true) {
          var temp = numbers.slice();
          loopSolve(nakedSingle);
          loopSolve(hiddenSingle);
          if (unchanged(numbers, temp)) {
            break;
          }
        }

        function loopSolve(code) {
          if (stopLoop) return;
          var temp = numbers.slice();
          code();
          if (!unchanged(numbers, temp)) {
            loopCount++;
            if (loopCount === maxCount) stopLoop = true;
            loopSolve(code);
          }
        }

        function unchanged(arr1, arr2) {
          return arr1.every(function (value, index) {
            return value === arr2[index];
          });
        }
      }

      loopSolveSudoku();

      var complete = sudokuComplete();

      if (!complete) {
        maxCount += loopCount;
        depth = -1;
        stopLoop = false;

        for (var i = 0; i < operations.length - 1; i++) {
          tryNumber(operations[i]);
          if (!complete) {
            restoreData();
          } else {
            break;
          }
        }

        if (!complete) {
          for (i = 0; i < 618; i++) {
            tryNumber("random");
            if (!complete) {
              restoreData();
            } else {
              break;
            }
          }
        }
      }

      function tryNumber(operation) {
        depth++;
        numbersBackup[depth] = numbers.slice();
        possibleValueBackup[depth] = arrayDeepCopy(possibleValue);
        var possibleArray = getPossibleArray(operation);
        for (var i = 0; i < possibleArray.length && !stopLoop; i++) {
          var index = possibleArray[i].index,
            arr = possibleValue[index],
            error = 0;
          for (var j = 0; j < arr.length && !stopLoop; j++) {
            updateState(index, arr[j], "假设法假设");
            loopSolveSudoku();
            if (!possibleValue.some(function (arr) {
              if (arr instanceof Array) return arr.length === 0;
            })) {
              if (sudokuComplete()) {
                complete = true;
              } else {
                tryNumber(operation);
                depth--;
              }
            } else {
              error++;
            }
            if (complete) break;
            numbers = numbersBackup[depth].slice();
            possibleValue = arrayDeepCopy(possibleValueBackup[depth]);
          }
          if (error === arr.length) break;
          if (complete) break;
        }

        function getPossibleArray(operation) {
          var arr = [];
          possibleValue.forEach(function (value, index) {
            if (value instanceof Array) {
              arr.push({
                index: index,
                length: value.length
              });
            }
          });
          switch (operation) {
            case "original":
              break;
            case "asc":
            case "desc":
              var asc = operation === "asc" ? -1 : 1;
              arr.sort(function (o1, o2) {
                if (o1.length < o2.length) {
                  return asc;
                } else if (o1.length > o2.length) {
                  return -asc;
                } else {
                  return 0;
                }
              });
              break;
            case "random":
              arr.sort(function () {
                return 0.5 - Math.random();
              });
              break;
            default:
              break;
          }
          return arr;
        }
      }

      function restoreData() {
        maxCount += maxCountStep;
        depth = -1;
        stopLoop = false;
        numbers = numbersBackup[0].slice();
        possibleValue = arrayDeepCopy(possibleValueBackup[0]);
      }

      function arrayDeepCopy(source) {
        var copy = [];
        loopCopy(copy, source);
        return copy;

        function loopCopy(copy, source) {
          source.forEach(function (item, index) {
            if (item instanceof Array) {
              copy[index] = [];
              loopCopy(copy[index], item);
            } else {
              copy[index] = item;
            }
          });
        }
      }

      function sudokuComplete() {
        return numbers.indexOf(0) === -1;
      }

      return {
        complete: complete,
        loopCount: loopCount,
        duration: Math.floor(performance.now() - startTime),
        numberArray: numbers,
        message: message
      };
    },
    isComplete: function () {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          if (!this.grids[i][j].isComplete()) return false;
        }
      }
      return true;
    },
    simpleRandom: function (ratio) {
      ratio = ratio || 0.4;
      var i, j, k, number;
      this.clear();
      for (j = 1; j < 10; j++) {
        while (number = this._rand(1, 10)) {
          for (k = Math.floor((j - 1) / 3) * 3 + 1; number && k < j; k++) {
            if (this.getNumber(k, k) === number) number = 0;
          }
          if (number) break;
        }
        this.setNumber(j, j, number);
      }
      for (j = 1; j < 10; j++) {
        while (number = this._rand(1, 10)) {
          for (k = Math.floor((j - 1) / 3) * 3 + 1; number && k < j; k++) {
            if (this.getNumber(k, 10 - k) === number) number = 0;
          }
          if (number && number !== this.getNumber(j, j)
            && number !== this.getNumber(10 - j, 10 - j)) {
            break;
          }
        }
        this.setNumber(j, 10 - j, number);
        if (j === 3) j += 3;
      }
      var numberArray = this.solve().numberArray;
      for (i = 0; i < numberArray.length; i++) {
        if (Math.random() < ratio) numberArray[i] = 0;
      }
      this.setNumberArray(numberArray);
    },
    _rand: janvas.Utils.randInt,
    _checkRow: function (left, center, right) {
      for (var k = 0; k < 3; k++) {
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            var c = this._cache[i * 3 + j], grid = arguments[i];
            c.number = grid.getNumber(k, j);
            c.text = grid.getText(k, j);
          }
        }
        this._check();
      }
    },
    _checkColumn: function (top, middle, bottom) {
      for (var k = 0; k < 3; k++) {
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            var c = this._cache[i * 3 + j], grid = arguments[i];
            c.number = grid.getNumber(j, k);
            c.text = grid.getText(j, k);
          }
        }
        this._check();
      }
    },
    _check: function () {
      for (var i = 0; i < 8; i++) {
        for (var j = i + 1; j < 9; j++) {
          var c1 = this._cache[i], c2 = this._cache[j];
          if (c1.number === c2.number) {
            c1.text.error(true);
            c2.text.error(true);
          }
        }
      }
    }
  },
  events: {
    eventdown: function (ev) {
      var rect;
      outer:
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            this._grid = this.grids[i][j];
            if ((rect = this._grid.isPointInPath(ev.$x, ev.$y))) {
              this.selector.setStart(ev.$x - this._offset, ev.$y - this._offset);
              this.selector.activate = true;
              this.selector.eventmove(ev.$x, ev.$y);
              this._rect = rect;
              break outer;
            }
          }
        }
      this.draw();
    },
    eventmove: function (ev) {
      if (this.selector.activate) {
        this.selector.eventmove(ev.$x, ev.$y);
      } else if (this.mainground.isPointInPath(ev.$x, ev.$y)) {
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            this.grids[i][j].eventmove(ev.$x, ev.$y);
          }
        }
      }
      this.draw();
    },
    eventup: function () {
      var number = this.selector.getEventNumber();
      if (number) {
        this._grid.setNumber(this._rect.i, this._rect.j, number, true);
        if (this.isComplete()) this.onComplete();
      } else if (this.selector.activate) {
        this._grid.setNumber(this._rect.i, this._rect.j, 0);
      }
      this.selector.activate = false;
      this.check();
      this.draw();
    },
    onComplete: janvas.Utils.noop,
    mousedown: function (ev) {
      switch (ev.button) {
        case 0:
          this.eventdown(ev);
          break;
        case 1:
          this.setNumberArray(this.solve().numberArray);
          break;
        case 2:
          this.simpleRandom();
          break;
      }
    },
    mousemove: function (ev) {
      this.eventmove(ev);
    },
    mouseup: function () {
      this.eventup();
    },
    touchstart: function (ev) {
      ev.preventDefault();
      switch (ev.targetTouches.length) {
        case 1:
          this.eventdown(ev.targetTouches[0]);
          break;
        case 2:
          if (this._fingerOut(ev)) this.setNumberArray(this.solve().numberArray);
          break;
        case 3:
          if (this._fingerOut(ev)) this.simpleRandom();
          break;
      }
    },
    _fingerOut: function (ev) {
      for (var i = 0; i < ev.targetTouches.length; i++) {
        var _ev = ev.targetTouches[i];
        if (this.mainground.isPointInPath(_ev.$x, _ev.$y)) return false;
      }
      return true;
    },
    touchmove: function (ev) {
      this.eventmove(ev.targetTouches[0]);
    },
    touchend: function () {
      this.eventup();
    }
  },
  functions: {
    getGrid: function (row, column) {
      return this.grids[Math.floor((row - 1) / 3)][Math.floor((column - 1) / 3)];
    },
    mod: function (num) {
      return (num - 1) % 3;
    }
  }
});

// 附：二次开发额外的一些用法
var numbers = [                                // 默认数据输入格式
  [[[3, 0, 4], [0, 0, 2], [8, 0, 0]],          // 需要注意是以宫为单位
    [[0, 2, 0], [0, 5, 1], [0, 0, 0]],         // 数据被设置时
    [[0, 0, 1], [0, 4, 9], [2, 0, 0]]],
  [[[9, 3, 0], [0, 7, 8], [0, 0, 0]],
    [[5, 0, 8], [3, 0, 0], [0, 0, 0]],
    [[0, 2, 0], [9, 0, 0], [0, 8, 0]]],
  [[[0, 0, 0], [0, 2, 6], [0, 0, 0]],
    [[0, 0, 0], [7, 0, 0], [0, 0, 5]],
    [[7, 6, 0], [0, 9, 8], [0, 0, 2]]]
];
sudoku.setNumbers(numbers);                    // 除了这种默认格式还有 setNumberArray 一维数组格式
sudoku.setNumber(2, 2, 6);                     // 在第 2 行第 2 列填充 6
sudoku.inverseSelector();                      // 翻转选择器的数字排列顺序
var number = sudoku.getNumber(2, 5);           // 获取第 2 行第 5 列的数值
var numberArray = sudoku.getNumberArray();     // 将数独转为一维数组
console.log(sudoku.isComplete());              // 判断数独是否还原
var solved = sudoku.solve();                   // 直接解决任意数独
sudoku.setNumberArray(solved.numberArray);     // 将解决后的一维数据设置进数独
sudoku.onComplete = function () {              // 数独还原的回调（限事件触发）
  console.log("isComplete:", this.isComplete());              // 判断数独是否还原
};
sudoku.clear();                                // 清空
sudoku.simpleRandom(0.4);                      // 随机一个数独 puzzle，传递的值表示挖空概率
