// DrawRectangle.js
function main() {
    // 获取 <canvas> 元素
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // 获取绘制二维图形的绘制上下文
    var ctx = canvas.getContext('2d');

    // 绘制蓝色矩形
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
    ctx.fillRect(120, 10, 150, 150);
    ctx.fillStyle = 'rgba(255, 0, 0, 1.0)';
    ctx.fillRect(10, 120, 150, 150);
}