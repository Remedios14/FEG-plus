var scene = null;
var camera = null;
var renderer = null;
var cameraControls = null;
var canvas = null;
var ccontent = null;
var gradc = null;
var jreader = null;
var stats = null;
var OnMesh = null;
var rayc = null;
var orthCam = null;
var orthCtrl = null;

// 后续读取模型中心
const model_center = new THREE.Vector3(-1126.244, 15.13, -62);
const color_bounds = [];

// 读取性能数据时方便管理筛选
const ptgroups = [];
const cubes = [];
const cvalues = [];
const invisibles = [];
var cnts = 0;
var pointer = new THREE.Vector2();

// 初始化的位置，以模型中心为参考
const cam_ori = (new THREE.Vector3(0, 150, 0)).add(model_center);
const light_ori = (new THREE.Vector3(0, 1000, 0)).add(model_center);

// 几何体可以共享，因此一个就够
const BSZ = 0.5;
const geometry = new THREE.BoxGeometry(BSZ, BSZ, BSZ);

THREE.Mesh.prototype.linked_val = null;
THREE.Mesh.prototype.linked_sec = null;

function MapMain() {
    canvas = document.querySelector('#mainCanvas');
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setClearColor(0x4B0082);
    scene = new THREE.Scene();
    rayc = new THREE.Raycaster();
    gradc = new GradColor();
    ccontent = canvas.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(75, ccontent.width / ccontent.height, 0.1, 1000);
    camera.position.set(cam_ori.x, cam_ori.y, cam_ori.z);
    scene.add(camera);

    const container = document.getElementById('container');
    stats = new Stats();
    container.appendChild(stats.dom);

    cameraControls = new THREE.OrbitControls(camera, canvas);
    cameraControls.enableZoom = true; // 滚轮-缩放/变焦
    cameraControls.enableRotate = true; // 左键-旋转
    cameraControls.enablePan = true; // 右键-平移
    cameraControls.rotateSpeed = 0.3;
    cameraControls.zoomSpeed = 1.0;
    cameraControls.panSpeed = 2.0;
    cameraControls.target = model_center;
    camera.lookAt(model_center);

    // {
    //     orthCam = new THREE.OrthographicCamera(ccontent.width / -2, ccontent.width / 2, ccontent.height / 2, ccontent.height / -2, 1, 1000);
    //     orthCam.position.set(cam_ori.x, cam_ori.y, cam_ori.z);
    //     scene.add(orthCam);

    //     orthCtrl = new THREE.OrbitControls(orthCam, canvas);
    //     orthCtrl.enableZoom = true; // 滚轮-缩放/变焦
    //     orthCtrl.enableRotate = true; // 左键-旋转
    //     orthCtrl.enablePan = true; // 右键-平移
    //     orthCtrl.rotateSpeed = 0.3;
    //     orthCtrl.zoomSpeed = 1.0;
    //     orthCtrl.panSpeed = 2.0;
    //     orthCtrl.target = model_center;
    //     orthCam.lookAt(model_center);
    // }
    
    // var loader = new THREE.FBXLoader();
    // loader.load('Scene.fbx', function(obj) {
    //     console.log("load fbx obj success!")
    //     mesh = obj.children[0].clone();
    //     scene.add(mesh);
    // })

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

    const onGeo = new THREE.BoxGeometry(BSZ * 1.5, BSZ * 1.5, BSZ * 1.5);
    onMat = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    OnMesh = new THREE.Mesh(onGeo, onMat);
    scene.add(OnMesh);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);

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
        cube.linked_val = pd.batchCnt;
        cube.linked_sec = pd.drawCallCnt;
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
    },
    camSwitcher: true,
    profileSwitcher: function() {
        for (var i = 0; i < cnts; i++) {
            col = gradc.valLerp([0, 300], cubes[i].linked_sec);
            cubes[i].material.color.set(col);
        }
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
    panelMain.add(global, 'restore').name('恢复隐藏节点');
    panelMain.add(global, 'camSwitcher').name('透视/正交切换');
    panelMain.add(global, 'profileSwitcher').name('切换性能指标');
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
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 因为 Raycast 的横纵轴范围是 [-1, 1] 所以都 × 2 再平移
function onPointerMove(event) {
    pointer.set(((event.clientX - ccontent.left) / ccontent.width) * 2 - 1,
        - ((event.clientY - ccontent.top) / ccontent.height) * 2 + 1);
    rayc.setFromCamera(pointer, camera);
    const intersects = rayc.intersectObjects(cubes, false);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (!intersect.object.visible) return;
        OnMesh.position.copy(intersect.object.position);
        const matC = intersect.object.material.color;
        OnMesh.material.color.setRGB(1 - matC.r, 1 - matC.g, 1 - matC.b);
    }
}

function onPointerDown(event) {
    pointer.set(((event.clientX - ccontent.left) / ccontent.width) * 2 - 1,
        - ((event.clientY - ccontent.top) / ccontent.height) * 2 + 1);
    rayc.setFromCamera(pointer, camera);
    const intersects = rayc.intersectObjects(cubes, false);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (!intersect.object.visible) return;
        console.log("mouse clicked on mesh object, log it's linking value below");
        console.log(intersect.object.linked_val);
    }
}
}

function animate() {
    requestAnimationFrame(animate);
    stats.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    // if (global.camSwitcher) {
    //     renderer.render(scene, camera);
    // } else {
    //     renderer.render(scene, orthCam);
    // }
}