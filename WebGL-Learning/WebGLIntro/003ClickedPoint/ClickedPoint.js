// ClickedPoint.js

// 顶点着色器程序
var VSHADER_SOURCE = `
attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
}
`;

// 片元着色器程序
var FSHADER_SOURCE = `
void main() {
    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
}
`;

function main() {
    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering cotext for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // 获取 attribute 变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // 注册鼠标点击事件响应函数
    canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position); };

    // 将定点位置传输给 attribute 变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = []; // 鼠标点击位置数组
function click(ev, gl, canvas, a_Position) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
    // 将坐标存储到 g_points 数组中
    g_points.push(x); g_points.push(y);

    // 清除 <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i = 0; i < len; i += 2) {
        // 将点的位置传递到变量中 a_Position
        gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);
        // 绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}