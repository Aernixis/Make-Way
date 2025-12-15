import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const ws=new WebSocket('https://makewayserver.onrender.com');
let state={}; let input={}; let meshes={};

window.create=()=>ws.send(JSON.stringify({type:'create'}));
window.join=()=>ws.send(JSON.stringify({type:'join',code:document.getElementById('code').value.toUpperCase()}));

ws.onmessage=e=>state=JSON.parse(e.data);

window.onkeydown=e=>{
  if(e.code==='KeyW') input.up=true;
  if(e.code==='KeyS') input.down=true;
  if(e.code==='KeyA') input.left=true;
  if(e.code==='KeyD') input.right=true;
  ws.send(JSON.stringify({type:'input',input}));
};
window.onkeyup=e=>{ if(['KeyW','KeyS','KeyA','KeyD'].includes(e.code)) input[e.code]=false; };

const scene=new THREE.Scene();
const cam=new THREE.OrthographicCamera(-30,30,30,-30,0.1,100);
cam.position.set(0,40,0); cam.lookAt(0,0,0);
const r=new THREE.WebGLRenderer(); r.setSize(innerWidth,innerHeight);
document.body.appendChild(r.domElement);
scene.add(new THREE.AmbientLight(0xffffff,1));

const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:0x222244}));
ground.rotation.x=-Math.PI/2; scene.add(ground);

function animate(){
  requestAnimationFrame(animate);
  if(state.players){
    state.players.forEach(p=>{
      if(!meshes[p.id]){
        meshes[p.id]=new THREE.Mesh(new THREE.BoxGeometry(1,1,2),new THREE.MeshNormalMaterial());
        scene.add(meshes[p.id]);
      }
      meshes[p.id].position.set(p.x,0,p.z);
      meshes[p.id].rotation.y=p.a;
    });
  }
  r.render(scene,cam);
}
animate();
