// ColoredPoints.js

// 顶点着色器程序
// x' = x cos b - y sin b
// y' = x sin b + y cos b
// z' = z
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main() {
    gl_Position = u_xformMatrix * a_Position;
}
`;

// 片元着色器程序
var FSHADER_SOURCE = `
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

var ANGLE = 90.0;

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

    // 设置顶点位置
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    var radian = Math.PI * ANGLE / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    // 需注意 WebGL 中的矩阵是按列主序的，即和常规理解差一个转置
    var xformMatrix = new Float32Array([
        cosB, sinB, 0.0, 0.0,
        -sinB, cosB, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    // 平移、缩放都很基础，略了

    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if (!u_xformMatrix) {
        console.log('Failed to set the positions of u_xformMatrix');
        return;
    }
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
    // POINTS、LINES、LINE_STRIP、LINE_LOOP、TRIANGLES、TRIANGLE_STRIP、TRIANGLE_FAN
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 将数据写入缓冲区对象
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // 将缓冲区对象分配给 a_Positioon 变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 连接 a_Position 变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}