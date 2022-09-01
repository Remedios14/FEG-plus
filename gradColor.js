// discarded，刚发现可以直接用 setRGB 按照 [0, 1] 范围插值
function GradColor(lbc, ubc) {
    if (lbc === undefined) {
        lbc = '#008080';
        ubc = '#7FFFAA';
    }
    this.lbc = lbc;
    this.ubc = ubc;
    this.getColorBounds();
}

GradColor.prototype.getColorBounds = function getColorBounds() {
    startRGB = this.colorRgb(this.lbc);
    endRGB = this.colorRgb(this.ubc);

    if (startRGB[0] > endRGB[0] || startRGB[1] > endRGB[1] || startRGB[2] > endRGB[2]) {
        console.warn('Setting Color of inversed bounds, better reset either bound');
    }

    this.lR = startRGB[0];
    this.lG = startRGB[1];
    this.lB = startRGB[2];
    this.uR = endRGB[0];
    this.uG = endRGB[1];
    this.uB = endRGB[2];
}

GradColor.prototype.setLowerBC = function setLowerBC(lbc) {
    this.lbc = lbc;
    this.getColorBounds();
}

GradColor.prototype.setUpperBC = function setUpperBC(ubc) {
    this.ubc = ubc;
    this.getColorBounds();
}

GradColor.prototype.gradientColor = function gradientColor(step) {

    sR = (this.uR - this.lR) / step;
    sG = (this.uG - this.lG) / step;
    sB = (this.uB - this.lB) / step;

    var colorArr = [];
    for (var i = 0; i < step; i++) {
        var hex = this.colorHex('rgb('+ parseInt((sR * i + startR))+ ',' + parseInt((sG * i + startG))+ ',' + parseInt((sB * i + startB)) + ')');
        colorArr.push(hex);
    }
    return colorArr;
}
GradColor.prototype.valLerp = function valLerp(bounds, val) {
    lower = bounds[0];
    upper = bounds[1];
    ratio = (val - lower) / (upper - lower);
    
    sR = this.uR * ratio + this.lR * (1 - ratio);
    sG = this.uG * ratio + this.lG * (1 - ratio);
    sB = this.uB * ratio + this.lB * (1 - ratio);

    sR = parseInt(sR);
    sG = parseInt(sG);
    sB = parseInt(sB);

    return this.colorHex('rgb(' + sR + ',' + sG + ',' + sB + ')');
}
// 转 rgb，得到三个通道整数值的 array
GradColor.prototype.colorRgb = function colorRgb(sColor) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = sColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange;
    } else {
        return sColor;
    }
};
// 转 hex
GradColor.prototype.colorHex = function colorHex(rgb) {
    var _this = rgb;
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
        var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            hex = hex < 10 ? 0 + '' + hex : hex;
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = _this;
        }
        return strHex;
    } else if (reg.test(_this)) {
        var aNum = _this.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return _this;
        } else if (aNum.length === 3) {
            var numHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    } else {
        return _this;
    }
}
