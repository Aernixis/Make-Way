<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Make Way Test</title>
<style>
  body,html{margin:0;padding:0;overflow:hidden;}
  #menu{
    position:absolute;width:100%;height:100%;
    display:flex;justify-content:center;align-items:center;
    background:#222; color:white; font-family:sans-serif; z-index:10;
  }
  canvas{position:absolute;top:0;left:0;z-index:1;}
</style>
</head>
<body>

<div id="menu">
  <button id="startBtn">Start Game</button>
</div>

<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script>
const menu = document.getElementById('menu');
document.getElementById('startBtn').onclick = ()=>{
  menu.style.display='none';
  startGame();
};

let scene, cam, renderer, cube;
function startGame(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4444aa);

  cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(10,20,10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff,0.5));

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({color:0x00aa00})
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // Test cube
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(5,5,5),
    new THREE.MeshStandardMaterial({color:0xff0000})
  );
  cube.position.set(0,2.5,20);
  scene.add(cube);

  cam.position.set(0,30,50);
  cam.lookAt(0,0,0);

  animate();
}

function animate(){
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  renderer.render(scene,cam);
}

window.addEventListener('resize',()=>{
  cam.aspect = window.innerWidth/window.innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
</script>
</body>
</html>
