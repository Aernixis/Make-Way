// --- Ground ---
const groundMat = new THREE.MeshStandardMaterial({color:0x111122}); // darker for contrast
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- Track Sections (Blue) ---
const trackMat = new THREE.MeshStandardMaterial({color:0x3366ff});
for(let i=0;i<50;i++){
  const seg = new THREE.Mesh(new THREE.BoxGeometry(4,0.5,10), trackMat);
  seg.position.set(Math.sin(i*0.2)*10,0.25,i*10); // slightly elevated
  scene.add(seg);
}

// --- Boost Pads (Yellow, elevated) ---
const boostMat = new THREE.MeshStandardMaterial({color:0xffff00});
for(let i=8;i<50;i+=12){
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2,0.5,2), boostMat);
  pad.position.set(Math.sin(i*0.2)*10,0.25,i*10);
  scene.add(pad);
}

// --- Checkpoints (Cyan, elevated and bigger) ---
const cpMat = new THREE.MeshStandardMaterial({color:0x00ffff});
for(let i=15;i<50;i+=15){
  const cp = new THREE.Mesh(new THREE.BoxGeometry(6,0.5,1), cpMat);
  cp.position.set(Math.sin(i*0.2)*10,0.25,i*10);
  scene.add(cp);
}

// --- Finish Line (Magenta, elevated) ---
const finishMat = new THREE.MeshStandardMaterial({color:0xff00ff});
finishLine = new THREE.Mesh(new THREE.BoxGeometry(6,0.5,1), finishMat);
finishLine.position.set(Math.sin(50*0.2)*10,0.25,50*10 + 0.5);
scene.add(finishLine);

// --- Camera (Top-Down Behind Car) ---
cam.position.set(0,15,-20);
cam.lookAt(car.position.x,0,car.position.z);
