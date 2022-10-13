# WebGL-Intro

WebGL 相当于在网页上运行的 OpenGL，可以分为 Js 和 WebGL 程序两个部分，其中主要有关图形学的是 WebGL 部分，需要使用 `顶点着色器和片元着色器`

1. 顶点着色器：有两个内置变量 `gl_Position` 和 `gl_PointSize`，其中位置必须，而大小默认 1.0
2. 片元着色器：内置变量 `gl_FragColor` 用于指定最终颜色（RGBA 格式）

## Js 和 WebGL 交互

想要将 Js 中的变量（如顶点坐标）传给 WebGL，可以使用 `attribute 变量和 uniform 变量`

1. attribute ：用于描述与顶点有关的数据，如坐标、法向、自发光等；**只有顶点着色器可以使用**
    1. 先在着色器中声明 `attribute vec4 a_Position;`
    2. 在 Js 中 `initShaders()` 初始化编译着色器
    3. 获取变量地址用于赋值 `var a_Position = gl.getAttribLocation(gl.program, 'a_Position');`；**若无相关变量或变量名非法，会返回 -1**
    4. 向该地址进行赋值 `gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);`；同族的有 1f、2f、3f、4f
2. uniform ：用于描述与顶点无关的数据
    1. 先在着色器中声明 `uniform vec4 u_FragColor;`
    2. 在 Js 中 `initShaders()` 初始化编译着色器
    3. 获取变量地址用于赋值 `var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');`；**若无相关变量或变量名非法，会返回 null**
    4. 向该地址进行赋值 `gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0);`；同族的有 1f、2f、3f、4f

## 注意项

1. 绑定鼠标点击事件

### 绑定鼠标点击事件

1. 鼠标点击位置是浏览器客户端的坐标，即以窗体页面的左上角为原点，向右为 x 正向，向下为 y 正向
2. 而 WebGL 的坐标以 canvas 中心为原点，向右 x 正向，向上 y 正向，取值范围 \[-1,1]；还有 z 轴正向是指向屏幕内
3. 需要执行转换计算

```js
var x = ev.clientX;
var y = ev.clientY;
var rect = ev.target.getBoundingClientRect();
x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
```