<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Make Way - Menu</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * {margin:0;padding:0;box-sizing:border-box;font-family:sans-serif;}
  body, html {width:100%;height:100%;overflow:hidden;background:#111;}
  
  /* Menu container */
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
  }

  h1 {margin-bottom:40px;font-size:3em;text-shadow:2px 2px 5px #000;}
  button {
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
  button:hover {background:#ffaa00;}

  select {margin:10px; padding:10px; font-size:1em;}
  
  canvas {display:block;}
</style>
</head>
<body>

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

<script type="module" src="game.js"></script>
<script>
  const menu = document.getElementById('menu');
  const startBtn = document.getElementById('startBtn');
  const trackSelect = document.getElementById('trackSelect');
  const carSelect = document.getElementById('carSelect');

  startBtn.onclick = () => {
    // Store selections (track/car) for game.js to use
    localStorage.setItem('selectedTrack', trackSelect.value);
    localStorage.setItem('selectedCar', carSelect.value);
    
    // Hide menu
    menu.style.display = 'none';
    
    // Start the game
    if(window.startGame) window.startGame(); // game.js will define startGame()
  }
</script>

</body>
</html>
