import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const cam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.5));

// --- Ground ---
const groundMat = new THREE.MeshStandardMaterial({color:0x222244});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- Track Sections ---
const track = [];
function createTrackSections(){
  const mat = new THREE.MeshStandardMaterial({color:0x4444aa});
  for(let i=0;i<50;i++){
    const seg = new THREE.Mesh(new THREE.BoxGeometry(4,0.5,10), mat);
    seg.position.set(Math.sin(i*0.2)*10,0,i*10);
    scene.add(seg);
    track.push(seg);
  }
}
createTrackSections();

// --- Boost Pads (no points) ---
const boostPads = [];
function createBoostPads(){
  const mat = new THREE.MeshStandardMaterial({color:0xffff00});
  for(let i=8;i<50;i+=12){
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2,0.1,2), mat);
    pad.position.set(Math.sin(i*0.2)*10,0.05,i*10);
    scene.add(pad);
    boostPads.push(pad);
  }
}
createBoostPads();

// --- Checkpoints (give 100 points, don't end race) ---
const checkpoints = [];
function createCheckpoints(){
  const mat = new THREE.MeshStandardMaterial({color:0x00ffff});
  for(let i=15;i<50;i+=15){
    const cp = new THREE.Mesh(new THREE.BoxGeometry(4,0.1,1), mat);
    cp.position.set(Math.sin(i*0.2)*10,0.05,i*10);
    scene.add(cp);
    checkpoints.push({mesh: cp, passed: false});
  }
}
createCheckpoints();

// --- Finish Line ---
const finishMat = new THREE.MeshStandardMaterial({color:0xff00ff});
const finishLine = new THREE.Mesh(new THREE.BoxGeometry(6,0.1,1), finishMat);
finishLine.position.set(Math.sin(50*0.2)*10,0.05,50*10 + 0.5);
scene.add(finishLine);

// --- Player Car ---
const carMat = new THREE.MeshStandardMaterial({color:0x00ff00});
const car = new THREE.Mesh(new THREE.BoxGeometry(1,0.5,2), carMat);
car.position.set(0,0.25,0);
scene.add(car);

let velocity = 0;
let rotation = 0;
let boostActive = false;
let boostTimer = 0;

const maxSpeed = 0.5;
const accel = 0.02;
const turnSpeed = 0.03;

// --- Laps & Score ---
let laps = 0;
let points = 0;
let crossedFinish = false;
let finishClaimed = false; // track first player crossing finish

// --- Keybinds with localStorage ---
let keybinds = {up:'KeyW', down:'KeyS', left:'KeyA', right:'KeyD', boost:'Space'};
if(localStorage.getItem('makewayKeybinds')){
  keybinds = JSON.parse(localStorage.getItem('makewayKeybinds'));
}

// --- Input ---
const input = {up:false,down:false,left:false,right:false,boost:false};
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

// --- Camera ---
function updateCamera(){
  cam.position.set(car.position.x,5,car.position.z-10);
  cam.lookAt(car.position.x,0,car.position.z);
}

// --- Collision & Game Logic ---
function checkCollision(){
  // Track boundaries
  for(const obs of track){
    const dx = car.position.x - obs.position.x;
    const dz = car.position.z - obs.position.z;
    if(Math.abs(dx)>2 || Math.abs(dz-obs.position.z)>5){
      velocity *= 0.9;
    }
  }

  // Boost pads
  for(const pad of boostPads){
    const dx = car.position.x - pad.position.x;
    const dz = car.position.z - pad.position.z;
    if(Math.sqrt(dx*dx + dz*dz)<1.5){
      boostActive = true;
      boostTimer = 30;
    }
  }

  // Checkpoints
  for(const cp of checkpoints){
    if(!cp.passed){
      const dx = car.position.x - cp.mesh.position.x;
      const dz = car.position.z - cp.mesh.position.z;
      if(Math.sqrt(dx*dx + dz*dz)<2){
        points += 100; // checkpoint points
        cp.passed = true;
        console.log('Checkpoint reached! +100 points');
      }
    }
  }

  // Finish line
  const dxF = car.position.x - finishLine.position.x;
  const dzF = car.position.z - finishLine.position.z;
  if(Math.sqrt(dxF*dxF + dzF*dzF)<3 && !crossedFinish){
    laps +=1;
    crossedFinish = true;
    if(!finishClaimed){
      points += 150; // first to cross finish
      finishClaimed = true;
      console.log('First to finish! +150 points');
    }
  }
  if(dzF > finishLine.position.z + 5){
    crossedFinish = false;
  }

  // Fall off track
  if(car.position.y < -5){
    velocity = 0;
    points = 0; // no points
    car.position.set(0,0.25,0);
    rotation = 0;
    console.log('Fell off! Points reset to 0');
  }
}

// --- Animate Loop ---
function animate(){
  requestAnimationFrame(animate);

  let currentAccel = accel;
  if(boostActive){
    currentAccel *= 2;
    boostTimer--;
    if(boostTimer<=0) boostActive=false;
  }

  if(input.up) velocity += currentAccel;
  if(input.down) velocity -= accel;
  if(input.boost) velocity += accel*2;
  velocity = Math.min(Math.max(velocity,-maxSpeed), maxSpeed);

  if(input.left) rotation += turnSpeed * (velocity>0?1:-1);
  if(input.right) rotation -= turnSpeed * (velocity>0?1:-1);

  car.rotation.y = rotation;
  car.position.x += Math.sin(rotation)*velocity;
  car.position.z += Math.cos(rotation)*velocity;

  checkCollision();
  updateCamera();

  renderer.render(scene, cam);
}
animate();

// --- Resize ---
window.addEventListener('resize', ()=>{
  cam.aspect = innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
