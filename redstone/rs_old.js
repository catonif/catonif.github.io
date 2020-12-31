/*class Updater {

    constructor(fId, value, index) {

        this.game = document.getElementById(fId);

        this.index = index;

        this.strLevel = value;

        this.rsDirY = [-1, 0, 1, 0];
        this.rsDirX = [0, 1, 0, -1];

        this.lvlLines = this.strLevel.split('#');
        this.env = new Array(this.lvlLines.length);
        for (let y = 0; y < this.lvlLines.length; y++) {
            this.env[y] = new Array(this.lvlLines[y].length);
            for (let x = 0; x < this.lvlLines[y].length; x++) {
                var element = this.lvlLines[y].charAt(x);
                switch (element) {
                    case ' ':
                        this.env[y][x] = {
                            type: 0,
                            state: 0,
                            pistonDir: -1
                        }
                        break;
                    case '.':
                        this.env[y][x] = {
                            type: 1,
                            state: 0
                        }
                        break;
                    case '!':
                        this.env[y][x] = {
                            type: 2,
                            state: 1,
                            edit: 0
                        }
                        break;
                    case '?':
                        this.env[y][x] = {
                            type: 2,
                            state: 0,
                            edit: 1
                        }
                        break;
                    case '^':
                        this.env[y][x] = {
                            type: 3,
                            state: 1,
                            pistonDir: 0
                        }
                        break;
                    case '>':
                        this.env[y][x] = {
                            type: 3,
                            state: 1,
                            pistonDir: 1
                        }
                        break;
                    case 'v':
                        this.env[y][x] = {
                            type: 3,
                            state: 1,
                            pistonDir: 2
                        }
                        break;
                    case '<':
                        this.env[y][x] = {
                            type: 3,
                            state: 1,
                            pistonDir: 3
                        }
                        break;
                    case 'o':
                        this.env[y][x] = {
                            type: 4,
                            state: 0
                        }
                }
            }
        }

        //this.render();
        this.update();

    }

    render() {
        let inner = "<code>";
        for (var y = 0; y < this.env.length; y++) {
            for (var x = 0; x < this.env[y].length; x++) {
                let c = this.env[y][x].type;
                switch (c) {
                    case 0:
                        if (this.env[y][x].pistonDir == -1) {
                            inner += '<img src="empty.png"/>';
                        } else {
                            inner += '<img src="pistonEnd' + parseInt(this.env[y][x].pistonDir) + '.png"/>'
                        }

                        break;

                    case 1:
                        inner += this.env[y][x].state ? '<img src="dust.png"/>' : '<img src="dustInactive.png"/>';
                        break;

                    case 2:
                        if (this.env[y][x].edit) {
                            inner +=
                                '<input type="checkbox" onchange="updaters[' + this.index + '].toggleCheckbox(this)" name="' + x + '" value="' + y + '"' + (this.env[y][x].state ? ' checked' : '') + '><img src="' +
                                'lever' + (this.env[y][x].state ? 1 : 0) + '.png"/>';
                        } else {
                            inner += '<img src="torch.png"/>';
                        }
                        break;

                    case 3:
                        let state = parseInt(this.env[y][x].state);
                        if (isNaN(state)) state = 1;
                        inner += ('<img src="piston' + state) + parseInt(this.env[y][x].pistonDir) + '.png"/>';
                        break;

                    case 4:
                        inner += '<img src="block.png"/>';
                        break;
                }
            }
            inner += "<br>";
        }
        inner += "</code>";
        this.game.innerHTML = inner;
    }

    update() {


        for (let y = 0; y < this.env.length; y++) {
            for (let x = 0; x < this.env[y].length; x++) {
                this.env[y][x].lastState = this.env[y][x].state;
                if (this.env[y][x].type != 2) {
                    this.env[y][x].state = 0;
                }
            }
        }

        for (let y = 0; y < this.env.length; y++) {
            for (let x = 0; x < this.env[y].length; x++) {
                if (this.env[y][x].type == 2) { // if torch
                    if (this.env[y][x].state) this.rsSetNeighboursPower(y, x);
                }
            }
        }

        for (let y = 0; y < this.env.length; y++) {
            for (let x = 0; x < this.env[y].length; x++) {
                if (this.env[y][x].type == 3) { // if piston
                    if (this.env[y][x].lastState != this.env[y][x].state) { // if the state has changes
                        if (this.env[y][x].state) {
                            this.rsPush(y, x, this.env[y][x].pistonDir, 1, +1); // push
                        } else {
                            this.rsPush(y, x, this.env[y][x].pistonDir, 2, -1); // or retract
                        }
                    }
                }
            }
        }

        this.render();
        if (this.hasChanged()) this.update();

    }

    hasChanged() {
        for (let y = 0; y < this.env.length; y++) {
            for (let x = 0; x < this.env[y].length; x++) {
                if (this.env[y][x].lastState != this.env[y][x].state) return true;
            }
        }
        return false;
    }



    rsSetNeighboursPower(y, x) {

        for (var dirIndex = 0; dirIndex < 4; dirIndex++) {
            var maybeX = x + (this.rsDirX[dirIndex]);
            var maybeY = y + (this.rsDirY[dirIndex]);
            let withLine = this.env[maybeY];
            if (withLine == undefined) continue;
            var withed = withLine[maybeX];
            if (withed == undefined) continue;
            if (withed.state) continue;
            if (!(withed.type & 1)) continue; // no empty, no torches, no blocks
            if (withed.type == 3) { // if piston
                if (withed.pistonDir == (dirIndex + 2) || withed.pistonDir == (dirIndex - 2)) continue; // don't get power from where you are pushing
            }
            withed.state = true;
            if (withed.type == 1) { // if dust
                this.rsSetNeighboursPower(maybeY, maybeX);
            }
        }
    }

    rsPush(startY, startX, pDir, dist, sign) {
        //console.log(startY, startX, pDir, dist, sign);
        var dirX = this.rsDirX[pDir];
        var dirY = this.rsDirY[pDir];
        var blockToMoveX = startX + (dirX * dist);
        var blockToMoveY = startY + (dirY * dist);
        if (dist == 2) {
            var onlyY = this.env[startY + dirY];
            if (onlyY != undefined) {
                var bothYX = onlyY[startX + dirX];
                if (bothYX != undefined) {
                    if (bothYX.type != 0) return; // there something, stop
                }
            }
        }
        if (blockToMoveX < 0 || blockToMoveY < 0) return;
        if (blockToMoveY >= this.env.length) return;
        if (blockToMoveX >= this.env[blockToMoveY].length) return;
        var withed = this.env[blockToMoveY][blockToMoveX];
        if (withed.type != 0) {
            let isActivePiston = (!!(withed.type === 3) && !!withed.state);
            if (sign == 1) {
                this.rsPush(blockToMoveY, blockToMoveX, pDir, (isActivePiston ? 1 : 0) + 1, sign);
            }
            let blockMovedX = blockToMoveX + (dirX * sign);
            let blockMovedY = blockToMoveY + (dirY * sign);
            this.env[blockMovedY][blockMovedX] = this.env[blockToMoveY][blockToMoveX];
            if (sign == 1) {
                this.env[blockToMoveY][blockToMoveX] = {
                    type: 0,
                    state: 0,
                    pistonDir: pDir
                };
            } else {
                this.env[blockToMoveY][blockToMoveX] = {
                    type: 0,
                    state: 0,
                    pistonDir: isActivePiston ? pDir : -1
                };
                this.rsPush(blockToMoveY, blockToMoveX, pDir, (isActivePiston ? 1 : 0) + 1, sign)
            }
        } else {
            if (dist != 2) {
                if (this.env[startY + dirY][startX + dirX].type == 0) {
                    this.env[startY + dirY][startX + dirX].pistonDir = -1;
                }
            } else withed.pistonDir = pDir;
        }
    }

    toggleCheckbox(element) {
        let x = parseInt(element.name);
        let y = parseInt(element.value);
        this.env[y][x].state = element.checked;
        this.update();
    }

}*/