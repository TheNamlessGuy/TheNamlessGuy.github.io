var canvas;
var g;
var controls;
var playareaSize;
var score;
var isGameover = false;
var player = {
  x: 3,
  y: 0,
  dir: 'r',
  nextdir: 'r',
  maxMoveTick: 10,
  movetick: this.maxMoveTick,
  maxRespawnTick: 25,
  respawntick: this.maxRespawnTick,
}
var trail;
var tetrises = [];

var BLOCK_SIZE = 73;
var PLAYER_Z = 0;
var TETRIS_Z = 1;
var POINT_Z = 2;

// PLAY AREA 9x15x3
var playArea = [
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
  [[null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
];

function pointExists() {
  for (var y = 0; y < playArea.length; y++) {
    for (var x = 0; x < playArea[y].length; x++) {
      if (playArea[y][x][POINT_Z] != null) {
        return true;
      }
    }
  }
  return false;
}

function noFallingBlocks() {
  for (var y = 0; y < playArea.length; y++) {
    for (var x = 0; x < playArea[y].length; x++) {
      if (playArea[y][x][TETRIS_Z] != null && playArea[y][x][TETRIS_Z].falling) {
        return false;
      }
    }
  }
  return true;
}

function rand(startval, endval) {
  return Math.floor(Math.random() * (endval - startval + 1)) + startval;
}

function spawnPoint() {
  var x, y;
  do {
    x = rand(0, playArea[0].length - 1);
    y = rand(3, playArea.length - 5);
  } while (playArea[y][x][TETRIS_Z] != null || playArea[0][x][TETRIS_Z] != null);

  for (var i = 0; i < y; i++) {
    if (playArea[i][x][TETRIS_Z] != null) {
      y = i - 1;
      break;
    }
  }

  playArea[y][x][POINT_Z] = new Point();
}

function spawnPlayer() {
  playArea[1][0][PLAYER_Z] = new Block("#F00");
  playArea[1][1][PLAYER_Z] = new Block("#F00");
  playArea[1][2][PLAYER_Z] = new Block("#F00");
  playArea[1][3][PLAYER_Z] = new Block("#F00");
  trail = [{x: 2, y: 1}, {x: 1, y: 1}, {x: 0, y: 1}];
  player.x = 3;
  player.y = 1;
  player.dir = 'r';
  player.nextdir = 'r';
  player.movetick = player.maxMoveTick;
  player.respawntick = player.maxRespawnTick;
  if (playArea[1][0][TETRIS_Z] != null || playArea[1][1][TETRIS_Z] != null || playArea[1][2][TETRIS_Z] != null || playArea[1][3][TETRIS_Z] != null) {
    gameover();
  }
}

function destroyTetris(x, y) {
  playArea[y][x][TETRIS_Z] = null;

  var i = 0;
  while (i < tetrises.length) {
    tetrises[i].remove(x, y);
    if (tetrises[i].locations.length == 0) {
      tetrises.splice(i, 1);
    } else {
      i++;
    }
  }
}

function checkForFilledRows() {
  for (var y = 0; y < playArea.length; y++) {
    rowIsFilled = true;
    for (var x = 0; x < playArea[0].length; x++) {
      if (playArea[y][x][TETRIS_Z] == null || playArea[y][x][TETRIS_Z].falling) {
        rowIsFilled = false;
      }
    }
    if (!rowIsFilled) {
      continue;
    }

    for (var x = 0; x < playArea[0].length; x++) {
      destroyTetris(x, y);
      score += 10;
    }
  }
}

function resetControls() {
  controls.up = false;
  controls.down = false;
  controls.left = false;
  controls.right = false;
  controls.action = false;
}

function gameover() {
  isGameover = true;
  resetControls();
}

function updateTrail(newX, newY) {
  trail.unshift(trail.pop());
  oldX = trail[0].x;
  oldY = trail[0].y;
  trail[0].x = newX;
  trail[0].y = newY;
  playArea[trail[0].y][trail[0].x][PLAYER_Z] = playArea[oldY][oldX][PLAYER_Z];
  playArea[oldY][oldX][PLAYER_Z] = null;
}

function playerCollision(x, y) {
  return playArea[y][x][PLAYER_Z] != null || playArea[y][x][TETRIS_Z] != null;
}

function moveTo(x, y) {
  if (playerCollision(x, y)) {
    gameover();
    return;
  }

  var lastX = player.x;
  var lastY = player.y;
  player.x = x;
  player.y = y;
  playArea[player.y][player.x][PLAYER_Z] = playArea[lastY][lastX][PLAYER_Z];
  playArea[lastY][lastX][PLAYER_Z] = null;
  updateTrail(lastX, lastY);
}

function update() {
  if (player.respawntick <= 0) {
    if (controls.up) {
      if (player.dir != 'd') {
        player.nextdir = 'u';
      }
    } else if (controls.down) {
      if (player.dir != 'u') {
        player.nextdir = 'd';
      }
    } else if (controls.left) {
      if (player.dir != 'r') {
        player.nextdir = 'l';
      }
    } else if (controls.right) {
      if (player.dir != 'l') {
        player.nextdir = 'r';
      }
    }
  }

  player.respawntick -= 1;
  player.movetick -= 1;
  if (player.movetick > 0) {
    return;
  }
  player.movetick = player.maxMoveTick;

  for (var i = 0; i < tetrises.length; i++) {
    tetrises[i].update();
  }
  checkForFilledRows();

  if (!pointExists() && noFallingBlocks()) {
    spawnPoint();
  }

  if (player.respawntick > 0) {
    return;
  }

  player.dir = player.nextdir;
  if (player.dir == 'u') {
    if (player.y == 0) {
      gameover();
      return;
    }
    moveTo(player.x, player.y - 1);
  } else if (player.dir == 'd') {
    if (player.y == playArea.length - 1) {
      gameover();
      return;
    }
    moveTo(player.x, player.y + 1);
  } else if (player.dir == 'l') {
    if (player.x == 0) {
      gameover();
      return;
    }
    moveTo(player.x - 1, player.y);
  } else if (player.dir == 'r') {
    if (player.x == playArea[0].length - 1) {
      gameover();
      return;
    }
    moveTo(player.x + 1, player.y);
  }

  if (playArea[player.y][player.x][POINT_Z] != null) {
    playArea[player.y][player.x][POINT_Z] = null;
    trail.push({x: player.x, y: player.y});
    tetrises.push(new Tetris(trail));
    spawnPlayer();
    score += 5;
  }
}

function draw() {
  g.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  g.beginPath();
  g.rect(playareaSize.x, playareaSize.y, playareaSize.w, playareaSize.h);
  g.fillStyle = "#777";
  g.fill();
  g.closePath();

  // Draw score
  g.fillStyle = "#FFF";
  g.fillText("Score: " + score, (canvas.width / 2) + (playareaSize.w / 2) + 20, 50);

  // Draw version
  g.fillStyle = "#222";
  text = "Version 0.2";
  console.log("AREA Y", playareaSize.h, "TEXT H", g.measureText(text).height, "50", 50);
  console.log("Y:", playareaSize.h - 48 - 50);
  g.fillText(text, (canvas.width / 2) + (playareaSize.w / 2) + 20, playareaSize.h - 20);

  // Draw play area
  for (var y = 0; y < playArea.length; y++) {
    for (var x = 0; x < playArea[y].length; x++) {
      for (var z = 0; z < playArea[y][x].length; z++) {
        if (playArea[y][x][z] != null) {
          playArea[y][x][z].draw(playareaSize.x + (x * BLOCK_SIZE), playareaSize.y + (y * BLOCK_SIZE), BLOCK_SIZE);
        }
      }
    }
  }

  if (isGameover) {
    // Draw GAME OVER
    g.fillStyle = "#800000";
    text = "GAME OVER";
    g.fillText(text, (canvas.width / 2) - (g.measureText(text).width / 2), 150);
    text = "Press enter or space to restart";
    g.fillText(text, (canvas.width / 2) - (g.measureText(text).width / 2), 250);
  }
}

function respawn() {
  for (var y = 0; y < playArea.length; y++) {
    for (var x = 0; x < playArea[y].length; x++) {
      for (var z = 0; z < playArea[y][x].length; z++) {
        playArea[y][x][z] = null;
      }
    }
  }

  tetrises.length = 0;
  score = 0;

  spawnPlayer();
  spawnPoint();
  isGameover = false;
  resetControls();
}

function loop() {
  if (!isGameover) {
    update();
  } else if (controls.action) {
    respawn();
    //location.reload();
  }
  draw();
  requestAnimationFrame(loop);
}

function onReady() {
  canvas = document.getElementById('gameCanvas');
  g = canvas.getContext('2d');

  controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false
  }
  setControls();

  playareaSize = { w: 657, h: canvas.height };
  playareaSize.x = (canvas.width / 2) - (playareaSize.w / 2);
  playareaSize.y = 0;
  score = 0;

  spawnPlayer();
  spawnPoint();

  g.translate(0.5, 0.5);
  g.font = "48px Arial";
  g.imageSmoothingEnabled = true;
  loop();
}

function setControls() {
  document.addEventListener('keydown', (e) => {
    switch(e.keyCode) {
      case 37: // Left
        controls.left = true;
        break;
      case 38: // Up
        controls.up = true;
        break;
      case 39: // Right
        controls.right = true;
        break;
      case 40: // Down
        controls.down = true;
        break;
      case 13: // Enter
        controls.action = true;
        break;
      case 32: // Space
        controls.action = true;
        break;
    }
  }, false);
  document.addEventListener('keyup', (e) => {
    switch(e.keyCode) {
      case 37: // Left
        controls.left = false;
        break;
      case 38: // Up
        controls.up = false;
        break;
      case 39: // Right
        controls.right = false;
        break;
      case 40: // Down
        controls.down = false;
        break;
      case 13: // Enter
        controls.enter = false;
        break;
      case 32: // Space
        controls.action = false;
        break;
    }
  }, false);
}