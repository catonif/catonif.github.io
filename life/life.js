/* code generated by tsc, og file in the same dir: life.ts */
var inputSize = document.getElementById("inputSize");
var inputNeighDistance = document.getElementById("inputNeighDistance");
var inputRenderIn2D = document.getElementById("inputRenderIn2D");
var inputRule = document.getElementById("inputRule");
var inputWait = document.getElementById("inputWait");
var inputAuto = document.getElementById("inputAuto");
var outputElement = document.getElementById("outputElement");
var Lifer = /** @class */ (function () {
    //count: number = 0;
    function Lifer() {
        this.cells = [];
        this.size = 0;
        this.neighDistance = 0;
        this.renderIn2D = true;
        this.grandTour = true;
        this.auto = false;
        this.values = [];
    }
    Lifer.prototype.flush = function () {
        outputElement.innerHTML = this.output;
    };
    Lifer.prototype.getCell = function (index) {
        return this.cells[this.pos(index)];
    };
    Lifer.prototype.setCell = function (index, value) {
        this.cells[this.pos(index)] = value;
    };
    Lifer.prototype.pos = function (i) {
        return i < 0 ? this.size - 1 : i >= this.size ? 0 : i;
    };
    Lifer.prototype.start = function () {
        console.log("Project started!");
        this.size = parseInt(inputSize.value);
        this.neighDistance = parseInt(inputNeighDistance.value);
        this.renderIn2D = inputRenderIn2D.checked;
        this.auto = inputAuto.checked;
        var rule = inputRule.value;
        this.output = '';
        this.grandTour = rule == "gt";
        if (!this.grandTour) {
            var ruleLenght = this.neighDistance * 4 + 2;
            this.values = new Array(ruleLenght);
            for (var i = 0; i < ruleLenght; i++)
                this.values[i] = false;
            if (rule.charAt(0) == '$') {
                var decimal = parseInt(rule.substr(1));
                if (!isNaN(decimal)) {
                    rule = decimal.toString(2);
                    while (rule.length < ruleLenght) {
                        rule = '0' + rule;
                    }
                }
                else {
                    this.output += "rule error: no numeric value after $";
                    return;
                }
            }
            if (rule.length < ruleLenght) {
                this.output += "rule error: not enough digits for the rule";
                return;
            }
            else if (rule.length > ruleLenght) {
                this.output += "number is to big ($0-$" + (1 << ruleLenght - 1) + " | " + ruleLenght + " binary digits)";
                return;
            }
            this.setFromString(rule);
        }
        if (this.grandTour) {
            //this.count = 1 << (this.values.length);
            this.grandStep(0);
        }
        else {
            this.fill();
            this.randomize();
            this.render(true);
            if (inputAuto.checked)
                this.step();
        }
    };
    Lifer.prototype.grandStep = function (i) {
        var _this = this;
        if (i % (1 << 4) == 0) {
            var rule = (i >> 4).toString(2);
            var ruleLenght = this.neighDistance * 4 + 2;
            if (rule.length > ruleLenght)
                return;
            while (rule.length < ruleLenght) {
                rule = '0' + rule;
            }
            this.setFromString(rule);
            this.output += "grand tour: now at rule " + rule + "<br>";
            this.fill();
            this.randomize();
            this.render(true);
            if (inputAuto.checked) {
                setTimeout(function () {
                    _this.grandStep(i + 1);
                }, parseInt(inputWait.value));
            }
        }
        else {
            this.generateNeighboursCount();
            this.render(false);
            if (inputAuto.checked) {
                this.grandStep(i + 1);
            }
        }
    };
    Lifer.prototype.step = function () {
        var _this = this;
        this.generateNeighboursCount();
        this.render(true);
        if (inputAuto.checked) {
            setTimeout(function () {
                _this.step();
            }, parseInt(inputWait.value));
        }
    };
    Lifer.prototype.setFromString = function (rule) {
        this.values = new Array(this.neighDistance * 4 + 2);
        for (var i = 0; i < rule.length; i++) {
            var v = parseInt(rule.charAt(i));
            if (!isNaN(v))
                this.values[i] = !!v;
            else { /* maybe thow an error or smn */ }
        }
    };
    Lifer.prototype.countNeighbours = function (startIndex) {
        var c = 0;
        for (var i = 1; i <= this.neighDistance; i++) {
            c += this.getCell(startIndex + i) ? 1 : 0;
            c += this.getCell(startIndex - i) ? 1 : 0;
        }
        return c;
    };
    Lifer.prototype.generateNeighboursCount = function () {
        for (var i = 0; i < this.cells.length; i++) {
            this.cells[i] = this.values[this.countNeighbours(i) * 2 + (this.getCell(i) ? 0 : 1)];
        }
    };
    Lifer.prototype.fill = function () {
        this.cells = new Array(this.size);
        for (var i = 0; i < this.size; i++) {
            this.cells[i] = false;
        }
    };
    Lifer.prototype.randomize = function () {
        for (var i = 0; i < this.cells.length; i++) {
            this.cells[i] = Math.round(Math.random()) != 0;
        }
    };
    Lifer.prototype.render = function (shouldFlush) {
        if (!this.renderIn2D)
            this.output = '';
        for (var i = 0; i < this.cells.length; i++) {
            this.output += this.cells[i] ? '&nbsp;' : 'O';
        }
        if (this.renderIn2D)
            this.output += '<br>';
        if (shouldFlush)
            this.flush();
    };
    return Lifer;
}());
var lifer = new Lifer();
