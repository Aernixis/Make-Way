import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- Multiplayer Setup ---
const ws = new WebSocket('wss://makewayserver.onrender.com'); // Replace with your own server
let state = { players: [] };
let input = {};
let meshes = {};
let localPlayerId = null;

window.create = () => ws.send(JSON.stringify({type:'create'}));
window.join = () => {
  const code = document.getElementById('code').value.toUpperCase();
  ws.send(JSON.stringify({type:'join', code}));
};

ws.onmessage = e => {
  const data = JSON.parse(e.data);
  state = data;
  if(data.id) localPlayerId = data.id;
};

// --- Input ---
window.onkeydown = e => {
  switch(e.code){
    case 'KeyW': input.up=true; break;
    case 'KeyS': input.down=true; break;
    case 'KeyA': input.left=true; break;
    case 'KeyD': input.right=true; break;
    case 'Space': input.boost=true; break;
  }
  ws.send(JSON.stringify({type:'input', input}));
};
window.onkeyup = e => {
  switch(e.code){
    case 'KeyW': input.up=false; break;
    case 'KeyS': input.down=false; break;
    case 'KeyA': input.left=false; break;
    case 'KeyD': input.right=false; break;
    case 'Space': input.boost=false; break;
  }
  ws.send(JSON.stringify({type:'input', input}));
};

// --- Three.js Setup ---
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,1));

// Ground
const groundMat = new THREE.MeshStandardMaterial({color:0x222244});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- Track ---
const track = [];
function createTrack(){
  const mat = new THREE.MeshStandardMaterial({color:0x4444aa});
  for(let i=0;i<50;i++){
    const seg = new THREE.Mesh(new THREE.BoxGeometry(4,0.5,10), mat);
    seg.position.set(Math.sin(i*0.2)*10, 0, i*10);
    scene.add(seg);
    track.push(seg);
  }
}
createTrack();

// --- Cars ---
function createCar(color=0xff0000){
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1,0.5,2), new THREE.MeshStandardMaterial({color}));
  car.add(body);
  return car;
}

// --- Animation Loop ---
function animate(){
  requestAnimationFrame(animate);

  if(state.players){
    state.players.forEach(p => {
      if(!meshes[p.id]){
        meshes[p.id] = createCar(p.color || 0xff0000);
        scene.add(meshes[p.id]);
      }
      const mesh = meshes[p.id];
      mesh.position.lerp(new THREE.Vector3(p.x,0.25,p.z),0.2);
      mesh.rotation.y += (p.a - mesh.rotation.y)*0.2;
    });
  }

  // Camera follows local player
  const local = state.players?.find(p=>p.id===localPlayerId);
  if(local){
    cam.position.set(local.x,5,local.z-10);
    cam.lookAt(local.x,0,local.z);
  }

  renderer.render(scene, cam);
}
animate();

// --- Resize ---
window.addEventListener('resize',()=> {
  cam.aspect = innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
