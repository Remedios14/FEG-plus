// HelloPoint1.js

// 顶点着色器程序
var VSHADER_SOURCE = `
void main() {
    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = 10.0;
}
`;

// 片元着色器程序
var FSHADER_SOURCE = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}