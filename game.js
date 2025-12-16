<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Make Way</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif;}
  html,body{width:100%;height:100%;overflow:hidden;background:#111;}

  /* Menu Styles */
  #menu {
    position:absolute;
    width:100%;
    height:100%;
    background:linear-gradient(135deg,#2222aa,#6611ff);
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    color:#fff;
    z-index:10;
    animation:menuBg 10s linear infinite;
  }

  @keyframes menuBg{
    0%{background:linear-gradient(135deg,#2222aa,#6611ff);}
    50%{background:linear-gradient(135deg,#6611ff,#22ffaa);}
    100%{background:linear-gradient(135deg,#2222aa,#6611ff);}
  }

  h1{margin-bottom:40px;font-size:3em;text-shadow:2px 2px 5px #000;}
  button{
    padding:15px 30px;
    margin:10px;
    font-size:1.2em;
    border:none;
    border-radius:10px;
    cursor:pointer;
    background:#ffcc00;
    color:#000;
    transition:0.2s;
  }
  button:hover{background:#ffaa00;}

  select{margin:10px;padding:10px;font-size:1em;}

  canvas{display:block;position:absolute;top:0;left:0;z-index:1;}
</style>
</head>
<body>

<!-- Menu -->
<div id="menu">
  <h1>Make Way</h1>

  <!-- Track Selection -->
  <label for="trackSelect">Select Track:</label>
  <select id="trackSelect">
    <option value="track1">Track 1</option>
    <option value="track2">Track 2</option>
  </select>

  <!-- Car Selection -->
  <label for="carSelect">Select Car:</label>
  <select id="carSelect">
    <option value="green">Green</option>
    <option value="red">Red</option>
    <option value="blue">Blue</option>
  </select>

  <!-- Buttons -->
  <button id="startBtn">Start Game</button>
  <button id="settingsBtn">Settings</button>
</div>

<!-- Include Three.js -->
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>

<script>
const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const trackSelect = document.getElementById('trackSelect');
const carSelect = document.getElementById('carSelect');

startBtn.onclick = ()=>{
  localStorage.setItem('selectedTrack',trackSelect.value);
  localStorage.setItem('selectedCar',carSelect.value);
  menu.style.display='none';
  startGame();
};

// --- Global Variables ---
let scene, cam, renderer;
let car, velocity=0, rotation=0, boostActive=false, boostTimer=0;
let maxSpeed=0.5, accel=0.02, turnSpeed=0.03;
let track=[], boostPads=[], checkpoints=[], finishLine;
let laps=0, points=0, crossedFinish=false, finishClaimed=false;
let keybinds={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',boost:'Space'};
if(localStorage.getItem('makewayKeybinds')){
  keybinds=JSON.parse(localStorage.getItem('makewayKeybinds'));
}
const input={up:false,down:false,left:false,right:false,boost:false};

// --- Start Game Function ---
function startGame(){
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111122);

  cam = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(10,20,10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff,0.5));

  // Ground
  const groundMat = new THREE.MeshStandardMaterial({color:0x111122});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500),groundMat);
  ground.rotation.x=-Math.PI/2;
  scene.add(ground);

  // --- Track ---
  const trackMat = new THREE.MeshStandardMaterial({color:0x3366ff});
  for(let i=0;i<50;i++){
    const seg = new THREE.Mesh(new THREE.BoxGeometry(4,0.5,10),trackMat);
    seg.position.set(Math.sin(i*0.2)*10,0.25,i*10);
    scene.add(seg);
    track.push(seg);
  }

  // --- Boost Pads ---
  const boostMat = new THREE.MeshStandardMaterial({color:0xffff00});
  for(let i=8;i<50;i+=12){
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2,0.5,2),boostMat);
    pad.position.set(Math.sin(i*0.2)*10,0.25,i*10);
    scene.add(pad);
    boostPads.push(pad);
  }

  // --- Checkpoints ---
  const cpMat = new THREE.MeshStandardMaterial({color:0x00ffff});
  for(let i=15;i<50;i+=15){
    const cp = new THREE.Mesh(new THREE.BoxGeometry(6,0.5,1),cpMat);
    cp.position.set(Math.sin(i*0.2)*10,0.25,i*10);
    scene.add(cp);
    checkpoints.push({mesh:cp,passed:false});
  }

  // --- Finish Line ---
  const finishMat = new THREE.MeshStandardMaterial({color:0xff00ff});
  finishLine = new THREE.Mesh(new THREE.BoxGeometry(6,0.5,1),finishMat);
  finishLine.position.set(Math.sin(50*0.2)*10,0.25,50*10+0.5);
  scene.add(finishLine);

  // --- Player Car ---
  const carColor = localStorage.getItem('selectedCar') || 'green';
  let carMat;
  if(carColor==='red') carMat = new THREE.MeshStandardMaterial({color:0xff0000});
  else if(carColor==='blue') carMat = new THREE.MeshStandardMaterial({color:0x0000ff});
  else carMat = new THREE.MeshStandardMaterial({color:0x00ff00});

  car = new THREE.Mesh(new THREE.BoxGeometry(1,0.5,2),carMat);
  car.position.set(0,0.25,0);
  scene.add(car);

  // --- Input ---
  window.addEventListener('keydown', e=>{
    if(e.code===keybinds.up) input.up=true;
    if(e.code===keybinds.down) input.down=true;
    if(e.code===keybinds.left) input.left=true;
    if(e.code===keybinds.right) input.right=true;
    if(e.code===keybinds.boost) input.boost=true;
  });
  window.addEventListener('keyup', e=>{
    if(e.code===keybinds.up) input.up=false;
    if(e.code===keybinds.down) input.down=false;
    if(e.code===keybinds.left) input.left=false;
    if(e.code===keybinds.right) input.right=false;
    if(e.code===keybinds.boost) input.boost=false;
  });

  // Set initial camera above and behind car
  cam.position.set(car.position.x,15,car.position.z-20);
  cam.lookAt(car.position.x,0,car.position.z);

  animate();
}

// --- Camera Update ---
function updateCamera(){
  cam.position.set(car.position.x,15,car.position.z-20);
  cam.lookAt(car.position.x,0,car.position.z);
}

// --- Collision & Logic ---
function checkCollision(){
  for(const obs of track){
    const dx = car.position.x - obs.position.x;
    const dz = car.position.z - obs.position.z;
    if(Math.abs(dx)>2 || Math.abs(dz-obs.position.z)>5) velocity*=0.9;
  }

  for(const pad of boostPads){
    const dx = car.position.x - pad.position.x;
    const dz = car.position.z - pad.position.z;
    if(Math.sqrt(dx*dx + dz*dz)<1.5){boostActive=true;boostTimer=30;}
  }

  for(const cp of checkpoints){
    if(!cp.passed){
      const dx = car.position.x - cp.mesh.position.x;
      const dz = car.position.z - cp.mesh.position.z;
      if(Math.sqrt(dx*dx + dz*dz)<2){
        points+=100;
        cp.passed=true;
        console.log('Checkpoint reached! +100 points');
      }
    }
  }

  const dxF = car.position.x - finishLine.position.x;
  const dzF = car.position.z - finishLine.position.z;
  if(Math.sqrt(dxF*dxF + dzF*dzF)<3 && !crossedFinish){
    laps+=1;
    crossedFinish=true;
    if(!finishClaimed){points+=150;finishClaimed=true;console.log('First to finish! +150 points');}
    console.log(`Lap ${laps} completed. Total points: ${points}`);
  }
  if(dzF>finishLine.position.z+5) crossedFinish=false;

  if(car.position.y<-5){velocity=0;points=0;car.position.set(0,0.25,0);rotation=0;console.log('Fell off! Points reset to 0');}
}

// --- Animate Loop ---
function animate(){
  requestAnimationFrame(animate);

  let currentAccel = accel;
  if(boostActive){currentAccel*=2;boostTimer--;if(boostTimer<=0) boostActive=false;}

  if(input.up) velocity+=currentAccel;
  if(input.down) velocity-=accel;
  if(input.boost) velocity+=accel*2;
  velocity=Math.min(Math.max(velocity,-maxSpeed),maxSpeed);

  if(input.left) rotation+=turnSpeed*(velocity>0?1:-1);
  if(input.right) rotation-=turnSpeed*(velocity>0?1:-1);

  car.rotation.y=rotation;
  car.position.x+=Math.sin(rotation)*velocity;
  car.position.z+=Math.cos(rotation)*velocity;

  checkCollision();
  updateCamera();
  renderer.render(scene,cam);
}

// --- Resize ---
window.addEventListener('resize',()=>{
  if(cam){cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
  if(renderer) renderer.setSize(innerWidth,innerHeight);
});

</script>
</body>
</html>
