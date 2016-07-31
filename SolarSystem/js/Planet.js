var fragment = 36;
var timeStep = 1/5;       // 时间流逝是 每秒 timeStep 天

var Planet = {
    /*
    * shaftAngle : 转轴倾角
    * r : 星球半径
    * distanceToSun : 距离太阳的距离
    * Bspeed : 公转速度
    * Sspeed : 自转速度
    * map : 贴图的url
    * BCycleCenter : 公转中心在世界坐标系的postion
    * */
    createNew: function (mass, shaftAngle, r, distanceToSun, Bspeed, Sspeed,map,BCycleCenter) {
        BCycleCenter = BCycleCenter || new THREE.Vector3(0,0,0);
        // 创建共转组
        var planet = new THREE.Object3D();
        planet.mass = mass;
        planet.dis = distanceToSun;
        planet.r = r;
        planet.BSpeed = Bspeed;
        planet.SSpeed = Sspeed;
        planet.position.copy(BCycleCenter);

        var texture = new THREE.TextureLoader().load(map);
        var subPlanet = new THREE.Mesh(new THREE.SphereGeometry(r, fragment, fragment),
            new THREE.MeshPhongMaterial( {map: texture} ));
        subPlanet.position.set(distanceToSun, 0, 0);
        subPlanet.rotation.y = shaftAngle;
        planet.add(subPlanet);

        // 自转轴 和 轨道
        var axi = Planet.createLineStripe({color:0xff0000,
            points:[new THREE.Vector3(0,0,1.5 * r), new THREE.Vector3(0,0,-1.5*r)]});
        subPlanet.add(axi);
        var points = [];
        var pointCount = 100;
        for(var i = 0; i < pointCount; i ++){
            var frad = i / pointCount * 2 * Math.PI;
            points.push(new THREE.Vector3(distanceToSun * Math.cos(frad), distanceToSun * Math.sin(frad), 0));
        }
        var orbit = Planet.createLineStripe({points:points,color:0x888888});
        planet.add(orbit);

        // function
        planet.rotate = function (delta) {
            planet.rotation.z += 2 * Math.PI * planet.BSpeed * timeStep * delta;                  // 公转
            subPlanet.rotation.z += 2 * Math.PI * planet.SSpeed * timeStep * delta;               // 自转
        };
        planet.getPosition=function(){      // subPlanet 的position 是相对于父节点的position
            var pos = new THREE.Vector4(-r,0,0,1);  // 赤道上的某个定点相对subPlanet的坐标
            return pos.applyMatrix4(subPlanet.matrixWorld);
        };
        planet.getLookPoint = function(){
            var pos = new THREE.Vector4(-2 * r * Math.cos(shaftAngle),0,-2*r*Math.sin(shaftAngle),1);
            pos = pos.applyMatrix4(subPlanet.matrixWorld);
            return pos;
        };
        planet.getUp = function(){
            return new THREE.Vector3(Math.sin(shaftAngle),0,Math.cos(shaftAngle));
        };
        planet.removeOrbit = function(){
            subPlanet.remove(axi);
            planet.remove(orbit);
        };
        return planet;
    },

    create : function(key){
        switch (key){
            case 'Sun':
                return Sun.createNewWithShader();
                break;
            case 'Earth':
                return Earth.createNew();
                break;
            case 'Saturn':
                return Saturn.createNew();
            default :
                return Planet.createNew(
                    Data.mass[key],
                    Data.ShaftAngle[key] / 180 * Math.PI,
                    Planet.reRadius(Data.Radius[key]),
                    Planet.reDis(Data.Dis[key]),
                    1 / Data.BPeriod[key],
                    1 / Data.SPeriod[key],
                    Data.map[key]);
                break;
        }
    },

    reRadius : function(r){
        return  Math.sqrt(r);
    },
    reDis : function(dis){
        return Math.sqrt(dis) * 16;
    },

    createLineStripe : function(params){  // vector数组
        var points = params.points || [];
        var color = params.color || 0xffffff;
        var geometry = new THREE.Geometry();
        for(var i = 0; i < points.length; i++){
            geometry.vertices.push(points[i]);
        }
        // 0xffffff = (ff,ff,ff)=(255,255,255)
        var material = new THREE.LineBasicMaterial({color:color, linewidth:5, opacity:.5});
        return new THREE.Line(geometry, material);
    }
};

// 太阳，shader写表面
var Sun = {
   /* createNew:function(){
        var params = {  r : Planet.reRadius(Data.SunData.r),
                    Sspeed : 1 / Data.SunData.SPeriod,
                    map:Data.map["Sun"] };

        var texture = new THREE.TextureLoader().load(params.map);
        var material = new THREE.MeshPhongMaterial( {map: texture} );
        var sun = new THREE.Mesh(new THREE.SphereGeometry(params.r, fragment, fragment),material);
        sun.position.set(0, 0, 0);
        var sunLight = new THREE.PointLight(0xffffff,1.2,1000);
        sunLight.position.set(0,0,0);
        sun.add(sunLight);
        sun.rotate = function () {
            sun.rotation.z += 2 * Math.PI * params.Sspeed * timeStep;
        };

        return sun;
    },*/

    createNewWithShader : function(PlanetClass){
        PlanetClass = PlanetClass || Planet;
        var params = {  r : PlanetClass.reRadius(Data.SunData.r),
            Sspeed : 1 / Data.SunData.SPeriod,
            map:Data.map["Sun"] };
        var key = "Sun";
        var planet = new THREE.Object3D();
        planet.mass = Data.mass[key];
        planet.r = params.r;
        planet.SSpeed = params.Sspeed;
        planet.dis = 0;
        planet.BSpeed = 0;

        var uniforms = {
            time:{type:"f",value:1.0},          // 对value 使用加法，所以不写成string
            texture1:{type:"t",value: new THREE.TextureLoader().load("./images/cloud.png")},
            texture2:{type:'t',value: new THREE.TextureLoader().load("./images/lavatile.jpg")}
        };
        uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.Repeat;
        uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.Repeat;
        var material = new THREE.ShaderMaterial( {
            defines: {
                FOO: "2.0",                     // 必须写成2.0并加引号，原因：GLSL不能进行类型转换，js会将浮点数2.0转为2
                BAR: true
            },
            uniforms: uniforms,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        } );

        var sun = new THREE.Mesh(new THREE.SphereGeometry(params.r, fragment, fragment),material);
        sun.position.set(0, 0, 0);
        var sunLight = new THREE.PointLight(0xffffff,1.2,1000);
        sunLight.position.set(0,0,0);

        planet.rotate = function (delta) {
            sun.rotation.z += 2 * Math.PI * planet.SSpeed * timeStep * delta;               // ???
            uniforms.time.value += delta;
        };

        planet.add(sun);
        planet.add(sunLight);
        return planet;
    }
};

// 地月系
var Earth = {
    createNew :function(PlanetClass){
        PlanetClass = PlanetClass || Planet;
        var key = "Earth";
        var earth = PlanetClass.createNew(
            Data.mass[key],
            Data.ShaftAngle[key] / 180 * Math.PI,
                        PlanetClass.reRadius(Data.Radius[key]),
                        PlanetClass.reDis(Data.Dis[key]),
                        1 / Data.BPeriod[key],
                        1 / Data.SPeriod[key],
                        Data.map[key]
                    );

        var dis= PlanetClass.reDis(Data.MoonData.dis);
        var moon = Planet.createNew(
            Data.mass[key],
            0,
            PlanetClass.reRadius(Data.Radius[key]) / 5,
            dis,
                        1 / Data.MoonData.BPeriod,
                        1 / Data.MoonData.SPeriod,
                        Data.map["Moon"],
                        new THREE.Vector3(PlanetClass.reDis(Data.Dis[key]),0,0)
                    );

        earth.add(moon);

        var rotate = earth.rotate;
        earth.rotate = function(delta){
            rotate(delta);
            moon.rotate(delta);
        };
        var removeOrbit = earth.removeOrbit;
        earth.removeOrbit = function(){
            removeOrbit();
            moon.removeOrbit();
        };
        return earth;
    }
};

// 土星， 土星环
var Saturn = {
    createNew : function(PlanetClass){
        PlanetClass = PlanetClass||Planet;
        var key = "Saturn";
        var shaftAngle = Data.ShaftAngle[key] / 180 * Math.PI;
        var r = PlanetClass.reRadius(Data.Radius[key]);
        var dis = PlanetClass.reDis(Data.Dis[key]);
        var mass = Data.mass[key];
        var planet = PlanetClass.createNew(
            mass,
            shaftAngle,
            r,
            dis,
            1 / Data.BPeriod[key],
            1 / Data.SPeriod[key],
            Data.map[key]);

        var ring = Saturn.createRing(new THREE.Vector3(dis,0,0),r* 1.5, r*2);
        planet.add(ring);
        return planet;
    },

    createRing : function(position,innerRadius, outerRadius){
        // Create our Saturn with nice texture
        var geometry = new Saturn.geometryRing(innerRadius, outerRadius, 60);
        var texture = new THREE.TextureLoader().load(Data.map["SatRing"]);
        var material = new THREE.MeshLambertMaterial( {map: texture, transparent:true } );
        var ringsMesh = new THREE.Mesh( geometry, material );
        ringsMesh.position.copy(position);
        ringsMesh.doubleSided = true;
        //ringsMesh.rotation.x = Math.PI / 2;
        return ringsMesh;
    },

    geometryRing : function(innerRadius, outRadius, pointCount){
        var ring = new THREE.Geometry();
        var i,frad,pos;
        for(i = 0; i < pointCount; i++){
            frad = i / pointCount * Math.PI * 2;
            pos = new THREE.Vector3(innerRadius * Math.cos(frad), innerRadius * Math.sin(frad),0);
            ring.vertices.push(pos);
            pos = new THREE.Vector3(outRadius * Math.cos(frad), outRadius * Math.sin(frad),0);
            ring.vertices.push(pos);
        }

        for(i = 0; i < pointCount; i++){
            var v0 = 2 * i, v1 = 2 *i + 1, v2 = (2 * i + 2) % (2 * pointCount), v3 = (2 * i + 3) % (2 * pointCount);
            // 建立两个三角形，模拟圆环的一部分
            ring.faces.push(new THREE.Face3(v0, v1, v2));
            ring.faces.push(new THREE.Face3(v1, v3, v2));
            // 对应于三角形的相应面的顶点的纹理坐标（）
            ring.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(1,0),new THREE.Vector2(0,1)]);
            ring.faceVertexUvs[0].push([new THREE.Vector2(1,0),new THREE.Vector2(1,1),new THREE.Vector2(0,1)]);

            // 反向建一个面，保证正反都能看到这个面
            ring.faces.push(new THREE.Face3(v0,v2,v1));
            ring.faces.push(new THREE.Face3(v1, v2, v3));
            ring.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(0,1),new THREE.Vector2(1,0)]);
            ring.faceVertexUvs[0].push([new THREE.Vector2(1,0),new THREE.Vector2(0,1),new THREE.Vector2(1,1)]);
        }

        ring.computeFaceNormals();
        return ring;
    }
};

var PlanetReal = {
    /*
     * shaftAngle : 转轴倾角
     * r : 星球半径
     * distanceToSun : 距离太阳的距离
     * Bspeed : 公转速度
     * Sspeed : 自转速度
     * map : 贴图的url
     * BCycleCenter : 公转中心在世界坐标系的postion
     * */
    createNew: function (mass, shaftAngle, r, distanceToSun, Bspeed, Sspeed,map,BCycleCenter) {
        var planet = Planet.createNew(mass, shaftAngle, r, distanceToSun, Bspeed, Sspeed,map,BCycleCenter);
        return planet;
    },

    create : function(key){
        var planet = null;
        switch (key){
            case 'Sun':
                planet = Sun.createNewWithShader(PlanetReal);
                break;
            case 'Earth':
                planet = Earth.createNew(PlanetReal);
                break;
            case 'Saturn':
                planet = Saturn.createNew(PlanetReal);
                break;
            default :
                planet = PlanetReal.createNew(
                    Data.mass[key],
                    Data.ShaftAngle[key] / 180 * Math.PI,
                    PlanetReal.reRadius(Data.Radius[key]),
                    PlanetReal.reDis(Data.Dis[key]),
                    1 / Data.BPeriod[key],
                    1 / Data.SPeriod[key],
                    Data.map[key]);
                break;
        }
        if(key != "Sun") planet.removeOrbit();
        return planet;
    },

    reRadius : function(r){
        return  r/250;
    },
    reDis : function(dis){
        return dis * 4;
    }
};
