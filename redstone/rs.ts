/* code generated by tsc, og file in this folder, rs.ts */
const rsDirY: number[] = [-1, 0, 1, 0];
const rsDirX: number[] = [0, 1, 0, -1];

const enum RsType { Empty, Dust, Torch, Piston, Block }

class RsPiece {

    public type: RsType = RsType.Empty;
    public state: boolean = false;

    public lastState: boolean = false;

    public edit: boolean; // for torches
    public pistonDir: number; // for empties and pistons

    constructor (type: RsType, state: boolean, edit: boolean = true, pistonDir: number = 0) {
        this.type = type;
        this.state = state;
        this.edit = edit;
        this.pistonDir = pistonDir;
    }

    public static fromChar(char: string) : RsPiece {
        switch (char) {
            case ' ': return new RsPiece(RsType.Empty, false, true, -1);
            case '.': return new RsPiece(RsType.Dust, false);
            case '!': return new RsPiece(RsType.Torch, true, false);
            case '?': return new RsPiece(RsType.Torch, false, true);
            case '^': return new RsPiece(RsType.Piston, false, true, 0);
            case '>': return new RsPiece(RsType.Piston, false, true, 1);
            case 'v': return new RsPiece(RsType.Piston, false, true, 2);
            case '<': return new RsPiece(RsType.Piston, false, true, 3);
            case 'o': return new RsPiece(RsType.Block, false);
            default: return new RsPiece(-1, false, false, -1);
        }
    }

    public innerString(index: number, x: number, y: number) : string {
        switch (this.type) {

            case RsType.Empty:
                if (this.pistonDir === -1) return '<img src="img/empty.png"/>';
                else return '<img src="img/pistonEnd' + this.pistonDir + '.png"/>'

            case RsType.Dust: return '<img src="img/dust' + (this.state ? 1 : 0) + '.png"/>';

            case RsType.Torch:
                if (this.edit) {
                    return '<input type="checkbox" onchange="updaters[' + index + '].toggleCheckbox(this.checked, '+x+', '+y+')"' +
                        (this.state ? ' checked' : '') + '><img src="img/' +
                        'lever' + (this.state ? 1 : 0) + '.png"/>';
                } else return '<img src="img/torch.png"/>';

            case RsType.Piston:
                let state: number = this.state ? 1 : 0;
                return '<img src="img/piston' + state + (this.pistonDir ? 1 : 0) + '.png"/>';

            case RsType.Block: return '<img src="img/block.png"/>';

        }
    }

}

var updaterIndex: number = 0;

class Updater {

    game: HTMLElement;
    public index: number;
    strLevel: string;

    env: RsPiece[][];

    constructor(fId: string, value: string) {

        this.game = document.getElementById(fId);

        this.strLevel = value;

        this.index = updaterIndex++;

        let lvlLines: string[] = this.strLevel.split('#');

        this.env = new Array(lvlLines.length);
        for (let y: number = 0; y < lvlLines.length; y++) {
            this.env[y] = new Array(lvlLines[y].length);
            for (let x: number = 0; x < lvlLines[y].length; x++) {
                this.env[y][x] = RsPiece.fromChar(lvlLines[y].charAt(x));
            }
        }

        this.update();

    }

    render() : void {
        let inner: string = "";
        for (let y: number = 0; y < this.env.length; y++) {
            for (let x: number = 0; x < this.env[y].length; x++) {
                inner += this.env[y][x].innerString(this.index, x, y);
            }
            inner += "<br>";
        }
        this.game.innerHTML = inner;
    }

    update() : void {

        for (let y: number = 0; y < this.env.length; y++) {
            for (let x: number = 0; x < this.env[y].length; x++) {
                let current: RsPiece = this.env[y][x];
                current.lastState = current.state;
                if (current.type != RsType.Torch) current.state = false;
            }
        }

        for (let y: number = 0; y < this.env.length; y++) {
            for (let x: number = 0; x < this.env[y].length; x++) {
                let current: RsPiece = this.env[y][x];
                if (current.type == RsType.Torch) {
                    if (current.state) this.rsSetNeighboursPower(y, x);
                }
            }
        }

        for (let y: number = 0; y < this.env.length; y++) {
            for (let x: number = 0; x < this.env[y].length; x++) {
                let current: RsPiece = this.env[y][x];
                if (current.type == RsType.Piston) {
                    if (current.lastState != current.state) {
                        if (current.state) this.rsPush(y, x, current.pistonDir, 1, +1); // push
                        else this.rsPush(y, x, current.pistonDir, 2, -1); // or retract
                    }
                }
            }
        }

        this.render();
        if (this.hasChanged()) this.update();

    }

    hasChanged() : boolean {
        for (let y: number = 0; y < this.env.length; y++) {
            for (let x: number = 0; x < this.env[y].length; x++) {
                let current: RsPiece = this.env[y][x];
                if (current.lastState != current.state) return true;
            }
        }
        return false;
    }



    rsSetNeighboursPower(y: number, x: number) : void {
        for (let dirIndex: number = 0; dirIndex < 4; dirIndex++) {
            let maybeX: number = x + (rsDirX[dirIndex]);
            let maybeY: number = y + (rsDirY[dirIndex]);
            let withed: RsPiece;
            try {
                withed = this.env[maybeY][maybeX];
                if (withed == undefined) continue;
            } catch { continue; }
            if (withed.state) continue;
            if (!(withed.type & 1)) continue; // no empty, no torches, no blocks
            if (withed.type == RsType.Piston) {
                if (withed.pistonDir == (dirIndex + 2) || withed.pistonDir == (dirIndex - 2)) continue; // don't get power from where you are pushing
            }
            withed.state = true;
            if (withed.type == RsType.Dust) { // if dust
                this.rsSetNeighboursPower(maybeY, maybeX);
            }
        }
    }

    rsPush(startY: number, startX: number, pDir: number, dist: number, sign: number) : void {
        let dirX: number = rsDirX[pDir];
        let dirY: number = rsDirY[pDir];
        let blockToMoveX: number = startX + (dirX * dist);
        let blockToMoveY: number = startY + (dirY * dist);
        if (dist == 2) {
            try {
                if (this[startY + dirY][startX + dirX].type != RsType.Empty) return;
            } catch { }
        }
        let withed: RsPiece;
        try {
            withed = this.env[blockToMoveY][blockToMoveX];
            if (withed == undefined) return;
        } catch { return; }
        if (withed.type != 0) {
            let isActivePiston: boolean = withed.type == 3 && withed.state;
            if (sign == 1) {
                this.rsPush(blockToMoveY, blockToMoveX, pDir, isActivePiston ? 2 : 1, sign);
            }
            let blockMovedX: number = blockToMoveX + (dirX * sign);
            let blockMovedY: number = blockToMoveY + (dirY * sign);
            this.env[blockMovedY][blockMovedX] = this.env[blockToMoveY][blockToMoveX];
            if (sign == 1) this.env[blockToMoveY][blockToMoveX] = new RsPiece(RsType.Empty, false, true, pDir);
            else {
                this.env[blockToMoveY][blockToMoveX] = new RsPiece(RsType.Empty, false, true, isActivePiston ? pDir : -1);
                this.rsPush(blockToMoveY, blockToMoveX, pDir, isActivePiston ? 2 : 1, sign);
            }
        } else {
            if (dist != 2) {
                let current: RsPiece = this.env[startY + dirY][startX + dirX];
                if (current.type == 0) current.pistonDir = -1;
            } else withed.pistonDir = pDir;
        }
    }

    toggleCheckbox(c: boolean, x: number, y: number) : void {
        this.env[y][x].state = c;
        this.update();
    }

}