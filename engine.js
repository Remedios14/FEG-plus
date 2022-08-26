var scene = null;
var camera = null;
var renderer = null;
var cameraControls = null;
var gradc = null;
var jreader = null;

// 后续读取模型中心
const model_center = new THREE.Vector3(-1126.244, 15.13, -62);
const color_bounds = [];

const cam_ori = (new THREE.Vector3(0, 150, 0)).add(model_center);
const light_ori = (new THREE.Vector3(0, 1000, 0)).add(model_center);

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
    len = loaded.length;
    console.log(len);
    console.log("start adding profile data into scene");
    for (var i = 0; i < len; i++) {
        const pd = loaded[i];
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        col = gradc.valLerp([0, 1000], pd.batchCnt);
        material = new THREE.MeshBasicMaterial( { color: col });
        cube = new THREE.Mesh(geometry, material);
        cube.position.x = pd.x;
        cube.position.y = pd.y;
        cube.position.z = pd.z;
        scene.add(cube);
    }
    console.log("add profile data finished");
}

var options = new function() {
    this.dataX = 0;
    this.dataY = 0;
    this.dataZ = 0;
    this.dataVal = 0;
    this.addCube = function() {
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        

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
function createGUI() {
    const gui = new dat.gui.GUI();
    const panelMain = gui.addFolder('GUI 主面板');
    const dataCube = panelMain.addFolder('追加单点的性能数据');
    const debugLog = panelMain.addFolder('一些debug用途的输出');
    dataCube.add(options, 'dataX').name('采集点X坐标');
    dataCube.add(options, 'dataY').name('采集点Y坐标');
    dataCube.add(options, 'dataZ').name('采集点Z坐标');
    dataCube.add(options, 'dataVal').name('采集点性能数值');
    dataCube.add(options, 'addCube').name('追加当前性能点');
    debugLog.add(states, 'logCameraPos').name('当前相机坐标');
    debugLog.add(states, 'logOrbitFocus').name('当前相机旋转焦点');
    panelMain.open();
    dataCube.open();
    debugLog.open();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}