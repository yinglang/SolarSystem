var KeyCameraListener = function(app){
    this.app = app;
    this.controls = null;
    this.setKeyListener = function () {
        var pressedKey = "";                // ������¼��ǰ���µļ���������������
        function keyDown(e) {
            if(pressedKey == ""){
                pressedKey = getKeyName();
            }
        }
        document.onkeydown = keyDown;

        function keyPress(e){
            if(pressedKey !== ""){
                switch (pressedKey){
                    case 'W':
                        app.scene.position.y += 10;
                        break;
                    case 'S':
                        app.scene.position.y -= 10;
                        break;
                    case 'A':
                        app.scene.position.x -= 10;
                        break;
                    case 'D':
                        app.scene.position.x += 10;
                        break;
                    case 'E':
                        app.changeView("Earth");
                        break;
                    case 'L':
                        app.changeView("All");
                        break;
                }
            }
        }
        document.onkeypress =keyPress;

        function keyUp(e){
            var keyName = getKeyName();
            if(keyName == pressedKey)
                pressedKey = "";            // �ͷ���
        }
        document.onkeyup = keyUp;

        function getKeyName(){
            var e = e || event;
            var currKey = e.keyCode || e.which || e.charCode;
            var keyName = String.fromCharCode(currKey);
            return keyName;
        }

        function moveInCameraWay(){
        }
    };
    this.setCameraListener = function(){
        var controls = new THREE.TrackballControls( app.camera );
        controls.rotateSpeed = 1.5;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', function(){
            app.renderer.render(app.scene,app.camera);
        } );
        this.controls = controls;
    };
    this.setOnWindowResize = function(){
        var that = this;
        function onWindowResize(){
            app.camera.aspect = window.innerWidth / window.innerHeight;
            app.camera.updateProjectionMatrix();
            app.renderer.setSize( window.innerWidth, window.innerHeight );
            that.controls.handleResize();
            app.renderer.render(app.scene,app.camera);
        }
        window.addEventListener("resize",onWindowResize,false);
    };
};
