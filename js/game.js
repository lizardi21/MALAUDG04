//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,

};

var latiosColors = {
	primary: 0x0011ff,
	secundary: 0xfafafa,
	eyes: 0xff0303
}

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          energy:100,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:100,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.6,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:600,
          seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinDistanceTolerance:15,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
  fieldLevel.innerHTML = Math.floor(game.level);
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = game.planeDefaultHeight;
  //camera.lookAt(new THREE.Vector3(0, 400, 0));

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}


function handleTouchEnd(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0x22E7F6,0x23FBA1, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}

var Latios = function(){

	this.mesh = new THREE.Object3D();

	// Create the Body **********************************
	addBody(this);

	// Create the tail **********************************
	addTail(this);

	// Create the wings **********************************
	addWings(this);

	// Create the Neck **********************************
	addNeck(this);

	// Create the Head **********************************
	addHead(this);

	// Create the Neck **********************************
	addEyes(this);

	// Create the Arms **********************************
	addArms(this);

	//this.mesh.rotation.y = 4.71;

};

function addBody(that) {
	var geomBody = new THREE.BoxGeometry(100,50,49,1,1,1);
	var matBody = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});
	var body = new THREE.Mesh(geomBody, matBody);
	body.castShadow = true;
	body.receiveShadow = true;
	that.mesh.add(body);

	// Create the white body **********************************
	var geomWhiteBody = new THREE.BoxGeometry(40,30,51,1,1,1);
	var matWhiteBody = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomWhiteBody.vertices[4].y=5;
	geomWhiteBody.vertices[5].y=5;
	geomWhiteBody.vertices[6].y=-5;
	geomWhiteBody.vertices[7].y=-5;

	var whiteBody = new THREE.Mesh(geomWhiteBody, matWhiteBody);
	whiteBody.castShadow = true;
	whiteBody.receiveShadow = true;
	whiteBody.position.x = 15;
	that.mesh.add(whiteBody);

	// Create the body-middle **********************************
	var geomBodyMiddle = new THREE.BoxGeometry(25,49,50,1,1,1);
	var matBodyMiddle = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});
	var bodyMiddle = new THREE.Mesh(geomBodyMiddle, matBodyMiddle);
	bodyMiddle.position.x = 45;
	bodyMiddle.castShadow = true;
	bodyMiddle.receiveShadow = true;
	that.mesh.add(bodyMiddle);

	// Create the body-front **********************************
	var geomBodyFront = new THREE.BoxGeometry(25,49,50,1,1,1);
	var matBodyFront = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomBodyFront.vertices[0].y=15;
	geomBodyFront.vertices[1].y=15;
	geomBodyFront.vertices[2].y=-15;
	geomBodyFront.vertices[3].y=-15;

	var bodyFront = new THREE.Mesh(geomBodyFront, matBodyFront);
	bodyFront.position.x = 60;
	bodyFront.castShadow = true;
	bodyFront.receiveShadow = true;
	that.mesh.add(bodyFront);
}

function addNeck(that) {
	var geomNeck = new THREE.BoxGeometry(80,30,30,1,1,1);
	var matNeck = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomNeck.vertices[0].y=8;
	geomNeck.vertices[1].y=8;
	geomNeck.vertices[2].y=-8;
	geomNeck.vertices[3].y=-8;

	that.neck = new THREE.Mesh(geomNeck, matNeck);
	that.neck.castShadow = true;
	that.neck.receiveShadow = true;
	that.neck.position.set(100,0,0);
	that.mesh.add(that.neck);
}

function addHead(that) {
	var geomHead = new THREE.BoxGeometry(25,19,28,1,1,1);
	var matHead = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomHead.vertices[0].y=1;
	geomHead.vertices[1].y=1;

	head = new THREE.Mesh(geomHead, matHead);
	head.castShadow = true;
	head.receiveShadow = true;
	head.position.set(150,0,0);
	that.mesh.add(head);

	// Front **********************************
	var geomHeadFront = new THREE.BoxGeometry(25,15,29,1,1,1);
	var matHeadFront = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});

	geomHeadFront.vertices[0].y=0.5;
	geomHeadFront.vertices[1].y=0.5;
	geomHeadFront.vertices[0].z=1;
	geomHeadFront.vertices[1].z=1;
	geomHeadFront.vertices[2].z=1;
	geomHeadFront.vertices[3].z=1;

	headFront = new THREE.Mesh(geomHeadFront, matHeadFront);
	headFront.castShadow = true;
	headFront.receiveShadow = true;
	headFront.position.set(150,5,0);
	that.mesh.add(headFront);

	// Top **********************************
	var geomHeadTop = new THREE.BoxGeometry(10,5,15,1,1,1);
	var matHeadTop = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomHeadTop.vertices[0].y=0.5;
	geomHeadTop.vertices[1].y=0.5;
	geomHeadTop.vertices[0].z=1;
	geomHeadTop.vertices[1].z=1;
	geomHeadTop.vertices[2].z=1;
	geomHeadTop.vertices[3].z=1;

	headTop = new THREE.Mesh(geomHeadTop, matHeadTop);
	headTop.castShadow = true;
	headTop.receiveShadow = true;
	headTop.position.set(153,8,0);
	that.mesh.add(headTop);

	addHorns(that);
}

function addHorns(that) {
	// Horn - left **********************************
	addHorn(that, -15);

	// Horn - right **********************************
	addHorn(that, 15);
}

function addHorn(that, pZ) {
	var geomHornLeft = new THREE.BoxGeometry(8,17,3,1,1,1);
	var matHornLeft = new THREE.MeshPhongMaterial({color:latiosColors.secundary, shading:THREE.FlatShading});

	geomHornLeft.vertices[0].x=0.3;
	geomHornLeft.vertices[1].x=0.3;

	hornLeft = new THREE.Mesh(geomHornLeft, matHornLeft);
	hornLeft.castShadow = true;
	hornLeft.receiveShadow = true;
	hornLeft.position.set(140,15,pZ);
	that.mesh.add(hornLeft);
}

function addEyes(that) {
	// Eyelids **********************************
	var geomEyelids = new THREE.BoxGeometry(10,5,29,1,1,1);
	var matEyelids = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});

	geomEyelids.vertices[2].x=15;
	geomEyelids.vertices[3].x=15;
	geomEyelids.vertices[4].x=-15;
	geomEyelids.vertices[5].x=-15;

	eyelids = new THREE.Mesh(geomEyelids, matEyelids);
	eyelids.castShadow = true;
	eyelids.receiveShadow = true;
	eyelids.position.set(150,3,0);
	that.mesh.add(eyelids);

	// Eyes **********************************
	var geomEyes = new THREE.BoxGeometry(5,5,30,1,1,1);
	var matEyes = new THREE.MeshPhongMaterial({color:latiosColors.eyes, shading:THREE.FlatShading});
	eyes = new THREE.Mesh(geomEyes, matEyes);
	eyes.castShadow = true;
	eyes.receiveShadow = true;
	eyes.position.set(150,3,0);
	that.mesh.add(eyes);
}

function addWings(that) {
	// Right
	addWing(that, 5.5, 80);
	// Left
	addWing(that, 10.2, -80);
}

function addWing(that, rX, pZ) {
	var geomWing = new THREE.BoxGeometry(40,8,150,1,1,1);
	var matWing = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});

	// Right
	geomWing.vertices[2].x=-15;
	geomWing.vertices[0].x=-15;

	// Left
	geomWing.vertices[5].x=-20;
	geomWing.vertices[7].x=-20;

	var wing = new THREE.Mesh(geomWing, matWing);
	wing.castShadow = true;
	wing.receiveShadow = true;
	wing.rotation.x = rX;
	wing.position.set(0,70,pZ);

	// Quills
	wing.add(addQuillsOfWings());
	
	that.mesh.add(wing);
}

function addQuillsOfWings() {
	var geomQuill = new THREE.BoxGeometry(10,8,10,1,1,1);
	var matQuill = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});

	// Top
	geomQuill.vertices[6].z=10;
	geomQuill.vertices[7].z=10;

	// Bottom
	geomQuill.vertices[4].z=10;
	geomQuill.vertices[5].z=10;

	var quill = new THREE.Mesh(geomQuill, matQuill);
	quill.position.set(-20,0,40);
	quill.castShadow = true;
	quill.receiveShadow = true;

	return quill;
}

function addTail(that) {
	var geomTailPlane = new THREE.BoxGeometry(10,45,45,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-55,0,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	that.mesh.add(tailPlane);

	// Tail feathers **********************************
	addTailFeathers(that);
}

function addTailFeathers(that) {
	// Right
	addTailFeather(that, -55, 15, 28, 10);
	addTailFeather(that, -60, 8, 28, 20);
	addTailFeather(that, -70, 0, 28, 20);
	addTailFeather(that, -60, -8, 28, 20);
	addTailFeather(that, -55, -15, 28, 10);

	// Left
	addTailFeather(that, -55, 15, -28, 10);
	addTailFeather(that, -60, 8, -28, 20);
	addTailFeather(that, -70, 0, -28, 20);
	addTailFeather(that, -60, -8, -28, 20);
	addTailFeather(that, -55, -15, -28, 10);
}

function addTailFeather(that, pX, pY, pZ, sY) {
	var geomTailFeathers = new THREE.BoxGeometry(40,sY,5,1,1,1);
	var matTailFeathers = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});

	geomTailFeathers.vertices[4].y=1;
	geomTailFeathers.vertices[5].y=1;
	geomTailFeathers.vertices[6].y=-1;
	geomTailFeathers.vertices[7].y=-1;

	tailFeathers = new THREE.Mesh(geomTailFeathers, matTailFeathers);
	tailFeathers.castShadow = true;
	tailFeathers.receiveShadow = true;
	tailFeathers.position.set(pX, pY, pZ);
	that.mesh.add(tailFeathers);
}

function addArms(that) {
	var geomArm = new THREE.BoxGeometry(30,10,60,1,1,1);
	var matArm = new THREE.MeshPhongMaterial({color:latiosColors.primary, shading:THREE.FlatShading});
	var arm = new THREE.Mesh(geomArm, matArm);
	arm.castShadow = true;
	arm.receiveShadow = true;
	arm.position.x = 25;
	that.mesh.add(arm);
}

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 20;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);
    var a = stepAngle*i;
    var h = game.seaRadius + 150 + Math.random()*200;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -300-Math.random()*500;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

Sky.prototype.moveClouds = function(){
  for(var i=0; i<this.nClouds; i++){
    var c = this.clouds[i];
    c.rotate();
  }
  this.mesh.rotation.z += game.speed*deltaTime;

}

Sea = function(){
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    //v.y = Math.random()*30;
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.CubeGeometry(20,20,20);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,

  });

  //*
  var nBlocs = 3+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
  //*/
}

Cloud.prototype.rotate = function(){
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++){
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.005*(i+1);
    m.rotation.y+= Math.random()*.002*(i+1);
  }
}

function getRing() {
  var geomRing = new THREE.TorusGeometry(10, 1, 5, 100);
	var matRing = new THREE.MeshPhongMaterial({color:0xc2e6f1, shading:THREE.FlatShading});
	ring = new THREE.Mesh(geomRing, matRing);
	ring.castShadow = true;
	ring.receiveShadow = true;
  ring.position.set(0,0,0);
  return ring;
}

Ennemy = function(){
  var geom = new THREE.TetrahedronGeometry(8,2);
  var mat = new THREE.MeshPhongMaterial({
    color:0x7ed3ef,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.mesh.add(getRing());
  this.angle = 0;
  this.dist = 0;
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(){
  var nEnnemies = game.level;

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;

    this.mesh.add(ennemy.mesh);
    this.ennemiesInUse.push(ennemy);
  }
}

EnnemiesHolder.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];
    ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;

    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    ennemy.mesh.rotation.z += Math.random()*.1;
    ennemy.mesh.rotation.y += Math.random()*.1;

    //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      removeEnergy();
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}

function getLeaf(pX, pZ){
  var geomLeaf = new THREE.BoxGeometry(2,8,1,1,1,1);
	var matLeaf = new THREE.MeshPhongMaterial({color:0x17a564, shading:THREE.FlatShading});
	leaf = new THREE.Mesh(geomLeaf, matLeaf);
	leaf.castShadow = true;
	leaf.receiveShadow = true;
  leaf.position.set(pX,5,pZ);
  return leaf;
}

Coin = function(){
  var geom = new THREE.SphereGeometry(3, 32, 32);
  var mat = new THREE.MeshPhongMaterial({
    color:0xf13381,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.mesh.add(getLeaf(0,0));
  this.mesh.add(getLeaf(1,0));
  this.mesh.add(getLeaf(-1,0));
  this.angle = 0;
  this.dist = 0;
}

CoinsHolder = function (nCoins){
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(){

  var nCoins = 1 + Math.floor(Math.random()*10);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
  }
}

CoinsHolder.prototype.rotateCoins = function(){
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.coinsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    coin.mesh.rotation.z += Math.random()*.1;
    coin.mesh.rotation.y += Math.random()*.1;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinDistanceTolerance){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
      addEnergy();
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}


// 3D Models
var sea;
var airplane;

function createPlane(){
  airplane = new Latios();
  airplane.mesh.scale.set(.25,.25,.25);
  airplane.mesh.position.y = game.planeDefaultHeight;
  scene.add(airplane.mesh);
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -game.seaRadius;
  scene.add(sky.mesh);
}

function createCoins(){

  coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
}

function createEnnemies(){
  for (var i=0; i<10; i++){
    var ennemy = new Ennemy();
    ennemiesPool.push(ennemy);
  }
  ennemiesHolder = new EnnemiesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(ennemiesHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(particlesHolder.mesh)
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if (game.status=="playing"){

    // Add energy coins every 100m;
    if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.distance);
      coinsHolder.spawnCoins();
    }

    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies();
    }

    if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.distance);
      game.level++;
      fieldLevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level
    }


    updatePlane();
    updateDistance();
    updateEnergy();
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed;

  }else if(game.status=="gameover"){
    game.speed *= .99;
    airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
    airplane.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;

    if (airplane.mesh.position.y <-200){
      showReplay();
      game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }

  sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

  if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  coinsHolder.rotateCoins();
  ennemiesHolder.rotateEnnemies();

  sky.moveClouds();
  sea.moveWaves();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
  fieldDistance.innerHTML = Math.floor(game.distance);
  var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
  levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy=false;

function updateEnergy(){
  game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  energyBar.style.right = (100-game.energy)+"%";
  energyBar.style.backgroundColor = (game.energy<50)? "#f25346" : "#68c3c0";

  if (game.energy<30){
    energyBar.style.animationName = "blinking";
  }else{
    energyBar.style.animationName = "none";
  }

  if (game.energy <1){
    game.status = "gameover";
  }
}

function addEnergy(){
  game.energy += game.coinValue;
  game.energy = Math.min(game.energy, 100);
}

function removeEnergy(){
  game.energy -= game.ennemyValue;
  game.energy = Math.max(0, game.energy);
}



function updatePlane(){

  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;


  game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  targetY += game.planeCollisionDisplacementY;

  airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*deltaTime*game.planeRotXSensivity;
  airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
  var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  camera.fov = normalize(mousePos.x,-1,1,40, 80);
  camera.updateProjectionMatrix ()
  camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;
}

function showReplay(){
  replayMessage.style.display="block";
}

function hideReplay(){
  replayMessage.style.display="none";
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;

function init(event){

  // UI

  fieldDistance = document.getElementById("distValue");
  energyBar = document.getElementById("energyBar");
  replayMessage = document.getElementById("replayMessage");
  fieldLevel = document.getElementById("levelValue");
  levelCircle = document.getElementById("levelCircleStroke");

  resetGame();
  createScene();

  createLights();
  createPlane();
  createSea();
  createSky();
  createCoins();
  createEnnemies();
  createParticles();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

window.addEventListener('load', init, false);
