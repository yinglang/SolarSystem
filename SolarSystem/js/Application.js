var Application = function(baseContainer){
    // 成员变量声明
    this.planets=null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.viewRole = null;

    // 私有成员函数声明
    function getContainersCount(){
        var containers = document.getElementsByClassName("container");
        return containers.length;
    }
    function createContainer(id){
        var containerCount = getContainersCount();
        id = id || "div_"+ containerCount;
        var div = document.createElement('div');
        div.setAttribute('id',id);
        div.setAttribute('class','container');
        baseContainer.appendChild(div);
        return div;
    }

    // public 成员函数声明
    this.init = function(){
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1,2000);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.renderer.setClearColor(new THREE.Color(0x333333,1));
        createContainer().appendChild(this.renderer.domElement);

        this.camera.position.set(-400,400,100);
        this.camera.up.set(0,0,1);                // 确认截平面的上为（0,0,1）z轴
        this.camera.lookAt(this.scene.position); // 由于帧刷新函数render里对camera的update，使得这里设置无效

        this.scene.add(new THREE.AmbientLight(0x505050));
        this.scene.add(new THREE.AmbientLight(0x676767));
    };
    this.addPlanets = function(){
        this.planets = {};
        this.planets.vir = {};
        this.planets.real = {};
        this.planets.virAll = new THREE.Object3D();
        this.planets.realAll = new THREE.Object3D();

        for (var key in Data.Dis) {
            this.planets.vir[key] = Planet.create(key);
            this.planets.virAll.add(this.planets.vir[key]);
            this.planets.real[key] = PlanetReal.create(key);
            this.planets.realAll.add(this.planets.real[key]);
        }
        key = "Sun";
        this.planets.vir[key] = Planet.create(key);
        this.planets.virAll.add(this.planets.vir[key]);
        this.planets.real[key] = PlanetReal.create(key);
        this.planets.realAll.add(this.planets.real[key]);

        this.viewRole = "All";
        this.scene.add(this.planets.virAll);
    };
    this.addBox = function(){
        var geometry = new THREE.BoxGeometry(100,100,100);
        var material = new THREE.MeshLambertMaterial({color:0xff0000});
        var mesh = new THREE.Mesh(geometry,material);
        this.scene.add(mesh);
        var light = new THREE.PointLight(0xffffff);
        light.position.set(300,400,200);
        this.scene.add(light);
    };
    this.addStars = function(starsCount, minDistance){
        var d = function(){return (Math.random()-0.5)*2 * minDistance;}; // 返回[-1,1] * minDistance

        var geometry = new THREE.Geometry();
        for(var i = 0; i < starsCount; i++){
            var pos = new THREE.Vector3(d(),d(),d());
            if(pos.length() < minDistance) { // 这是length()函数，代表向量长度
                pos.setLength(minDistance);
            }
            geometry.vertices.push(pos);
        }
        var r = Math.random();
        var size = 1;
        if(r  < 0.5) size =1;
        else if(r < 0.8) size = 2;
        else size =3;
        var material = new THREE.PointsMaterial({color:0xf0f0f0, size:size, sizeAttenuation: false});
        var stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    };

        // 多视角，在键盘事件中调用,viewRole表示你站在那里,对每个星球设置一个观察点（Object）
    this.changeView =function(viewRole){
        this.viewRole = viewRole;
        if(viewRole == "All"){
            this.camera.fov = 60;
            this.camera.updateProjectionMatrix();
            this.scene.remove(this.planets.realAll);
            this.scene.add(this.planets.virAll);
        }else{
            this.camera.fov = 120;              // 变更了，必须要调用这句
            this.camera.updateProjectionMatrix();
            this.scene.remove(this.planets.virAll);
            this.scene.add(this.planets.realAll);
        }
    };
    this.updateCamera = function(){
        if(this.viewRole == "All") {
            this.keyCameraListener.controls.update();
        }
        else {
            var p = this.planets.real["Earth"].getPosition();
            this.camera.rotation.x = Math.PI / 2;
            this.camera.position.set(p.x, p.y, p.z);
            this.camera.up=this.planets.real["Earth"].getUp();
            this.camera.lookAt(this.planets.real["Earth"].getLookPoint());
        }
    };
    this.addListener = function(){
        this.keyCameraListener = new KeyCameraListener(this);
        this.keyCameraListener.setKeyListener();
        this.keyCameraListener.setCameraListener();
        this.keyCameraListener.setOnWindowResize();
    };

    this.render = function(){
        var delta = this.clock.getDelta();

        // 渲染
        this.renderer.render(this.scene, this.camera);

        // camera的位置更新
        this.updateCamera();

        // 星球公转和自转
        for(var key in this.planets.vir){
            this.planets.vir[key].rotate(delta);
            this.planets.real[key].rotate(delta);
        }

        // 下一帧调用自己
        var that = this;
        requestAnimationFrame(function(){that.render();});    // 不能直接将render传入
    };

    // 函数调用
    this.init();
    //this.addBox();
    this.addPlanets();
    this.addStars(1000,800);
    this.addListener();


};

/* think :
    多视角：
    为了保证视点的改变，最好在视点处新设置一个Object3D,用他的世界坐标（0，0，0，1).applyMatrix(object.matrixWorld)

    流星视角：
    重写camera事件，this.keyCameraListener.useMeteorView = true/false切换相机事件//（重写一个update）

    碰撞：
    phyjs 或 手写

    碰撞动画：

    土星环：
*/
