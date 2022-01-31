top.Colors = function () {
    this.list = {
        black: [22, 22, 24],
        white: [242, 245, 244],
        red: [238, 77, 46],
        gray: [136, 136, 136],
        pink: [255, 0, 130],
        green: [92, 184, 92],
        blue: [0, 143, 255],
        yellow: [247, 197, 22],
        cyan: [0, 255, 255]
    };

    this.getRgb = function (color) {
        return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    }

    this.black = function () {
        return this.getRgb(this.list.black);
    }

    this.white = function () {
        return this.getRgb(this.list.white);
    }

    this.red = function () {
        return this.getRgb(this.list.red);
    }

    this.gray = function () {
        return this.getRgb(this.list.gray);
    }

    this.pink = function () {
        return this.getRgb(this.list.pink);
    }

    this.green = function () {
        return this.getRgb(this.list.green);
    }

    this.blue = function () {
        return this.getRgb(this.list.blue);
    }

    this.yellow = function () {
        return this.getRgb(this.list.yellow);
    }

    this.cyan = function () {
        return this.getRgb(this.list.cyan);
    }
};
