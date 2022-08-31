var scene = null;
var camera = null;
var renderer = null;
var cameraControls = null;
var gradc = null;
var jreader = null;
var stats = null;

// 后续读取模型中心
const model_center = new THREE.Vector3(-1126.244, 15.13, -62);
const color_bounds = [];

// 读取性能数据时方便管理筛选
const ptgroups = [];
const cubes = [];
const cvalues = [];
const invisibles = [];
var cnts = 0;

// 初始化的位置，以模型中心为参考
const cam_ori = (new THREE.Vector3(0, 150, 0)).add(model_center);
const light_ori = (new THREE.Vector3(0, 1000, 0)).add(model_center);

// 几何体可以共享，因此一个就够
const BSZ = 0.5;
const geometry = new THREE.BoxGeometry(BSZ, BSZ, BSZ);

function MapMain() {
    const canvas = document.querySelector('#mainCanvas');
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setClearColor(0x4B0082);
    scene = new THREE.Scene();
    gradc = new GradColor();
    canvas_centent = canvas.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(75, canvas_centent.width / canvas_centent.height, 0.1, 1000);
    camera.position.set(cam_ori.x, cam_ori.y, cam_ori.z);
    scene.add(camera);

    const container = document.getElementById('container');
    stats = new Stats();
    container.appendChild(stats.dom);

    cameraControls = new THREE.OrbitControls(camera, canvas);
    cameraControls.enableZoom = true;
    cameraControls.enableRotate = true;
    cameraControls.enablePan = true;
    cameraControls.rotateSpeed = 0.3;
    cameraControls.zoomSpeed = 1.0;
    cameraControls.panSpeed = 2.0;
    cameraControls.target = model_center;
    camera.lookAt(model_center);
    
    var loader = new THREE.OBJLoader();
    loader.load('Station.obj', function(obj) {
        obj.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.side = THREE.DoubleSide;
            }
        });
        console.log(obj)
        scene.add(obj);
    });
    
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(light_ori.x, light_ori.y, light_ori.z);
    scene.add(light);

    createGUI();
    loadProfile();
    animate();
}

function loadProfile() {
    jreader = new ProfileReader();
    loaded = jreader.readJson();
    cnts = loaded.length;
    console.log(cnts);
    console.log("start adding profile data into scene");
    for (var i = 0; i < cnts; i++) {
        const pd = loaded[i];
        col = gradc.valLerp([0, 1000], pd.batchCnt);
        material = new THREE.MeshBasicMaterial( { color: col });
        cube = new THREE.Mesh(geometry, material);
        cube.position.x = pd.x;
        cube.position.y = pd.y;
        cube.position.z = pd.z;
        cubes.push(cube);
        cvalues.push(pd.batchCnt);
        scene.add(cube);
    }
    console.log("add profile data finished");
}

{ // UI 控制代码块
var options = new function() {
    this.dataX = 0;
    this.dataY = 0;
    this.dataZ = 0;
    this.dataVal = 0;
    this.addCube = function() {
        col = gradc.valLerp([0, 40], 17);
        // material = new THREE.MeshBasicMaterial( { color: 0x0000FF });
        material = new THREE.MeshBasicMaterial( { color: col });
        cube = new THREE.Mesh(geometry, material);
        cube.position.x = this.dataX;
        cube.position.y = this.dataY;
        cube.position.z = this.dataZ;
        scene.add(cube);
    };
};
var states = new function() {
    this.logCameraPos = function() {
        console.log(camera.position);
    }
    this.logOrbitFocus = function() {
        console.log(cameraControls.target);
    }
};
var global = {
    restore: function() {
        for (var i = 0; i < invisibles.length; i++) {
            invisibles[i].visible = true;
        }
        invisibles.length = 0;
    }
};
var vFilter = new function() {
    this.lbound = 0;
    this.ubound = 1000;
    // 小于下界值的过滤掉
    this.withinFilter = function() {
        global.restore();
        for (var i = 0; i < cnts; i++) {
            if (cvalues[i] < this.lbound || cvalues[i] > this.ubound) {
                cubes[i].visible = false;
                invisibles.push(cubes[i]);
            }
        }
    }
}
var rFilter = new function() {
    this.lratio = 0;
    this.uratio = 100;
    this.withinFilter = function() {
        global.restore();
        for (var i = 0; i < 100; i++) {
            if (i >= this.lratio && i < this.uratio) {
                continue;
            }
            ptgroups[i].visible = false;
            invisibles.push(ptgroups[i]);
        }
    }
}
function createGUI() {
    const gui = new dat.gui.GUI();
    const panelMain = gui.addFolder('GUI 主面板');
    const dataCube = panelMain.addFolder('追加单点的性能数据');
    const debugLog = panelMain.addFolder('一些debug用途的输出');
    const valFilter = panelMain.addFolder('按照数值进行筛选');
    const rtoFilter = panelMain.addFolder('按照比例进行筛选');
    panelMain.add(global, 'restore').name('恢复所有隐藏节点');
    dataCube.add(options, 'dataX').name('采集点X坐标');
    dataCube.add(options, 'dataY').name('采集点Y坐标');
    dataCube.add(options, 'dataZ').name('采集点Z坐标');
    dataCube.add(options, 'dataVal').name('采集点性能数值');
    dataCube.add(options, 'addCube').name('追加当前性能点');
    debugLog.add(states, 'logCameraPos').name('当前相机坐标');
    debugLog.add(states, 'logOrbitFocus').name('当前相机旋转焦点');
    valFilter.add(vFilter, 'lbound').name('小于该值隐藏');
    valFilter.add(vFilter, 'ubound').name('大于该值隐藏');
    valFilter.add(vFilter, 'withinFilter').name('执行过滤');
    // 等步长均匀分布
    rtoFilter.add(rFilter, 'lratio', 0, 100, 1).name('小于该百分隐藏');
    rtoFilter.add(rFilter, 'uratio', 0, 100, 1).name('大于该百分隐藏');
    rtoFilter.add(rFilter, 'withinFilter').name('执行过滤');
    panelMain.open();
    // dataCube.open();
    // debugLog.open();
    valFilter.open();
    rtoFilter.open();
}
}

{ // 进行事件绑定函数定义
{
    
}
}

function animate() {
    requestAnimationFrame(animate);
    stats.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}