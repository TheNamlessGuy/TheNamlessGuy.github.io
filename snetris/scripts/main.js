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
}
var trail;
var tetrises = [];

var BLOCK_SIZE = 73;

var playArea = [
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
];

function rand(startval, endval) {
  return Math.floor(Math.random() * (endval - startval + 1)) + startval;
}

function spawnPoint() {
  var x, y;
  do {
    x = rand(0, playArea[0].length - 1);
    y = rand(3, playArea.length - 5);
  } while (playArea[y][x] != null);

  playArea[y][x] = new Point();
}

function spawnPlayer() {
  playArea[1][0] = new Block("#F00");
  playArea[1][1] = new Block("#F00");
  playArea[1][2] = new Block("#F00");
  playArea[1][3] = new Block("#F00");
  trail = [{x: 2, y: 1}, {x: 1, y: 1}, {x: 0, y: 1}];
  player.x = 3;
  player.y = 1;
  player.dir = 'r';
  player.nextdir = 'r';
  player.movetick = player.maxMoveTick;
}

function destroy(x, y) {
  playArea[y][x] = null;

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
      if (playArea[y][x] == null || playArea[y][x] instanceof Point || playArea[y][x].color == "#F00" || playArea[y][x].falling) {
        rowIsFilled = false;
      }
    }
    if (!rowIsFilled) {
      continue;
    }

    for (var x = 0; x < playArea[0].length; x++) {
      destroy(x, y);
      score += 10;
    }
  }
}

function gameover() {
  isGameover = true;
  controls.up = false;
  controls.down = false;
  controls.left = false;
  controls.right = false;
}

function updateTrail(newX, newY) {
  trail.unshift(trail.pop());
  oldX = trail[0].x;
  oldY = trail[0].y;
  trail[0].x = newX;
  trail[0].y = newY;
  playArea[trail[0].y][trail[0].x] = playArea[oldY][oldX];
  playArea[oldY][oldX] = null;
}

function collision(x, y) {
  return !(playArea[y][x] == null || playArea[y][x] instanceof Point);
}

function moveTo(x, y) {
  if (collision(x, y)) {
    gameover();
    return;
  }

  var point = false;
  if (playArea[y][x] instanceof Point) {
    point = true;
  }

  var lastX = player.x;
  var lastY = player.y;
  player.x = x;
  player.y = y;
  playArea[player.y][player.x] = playArea[lastY][lastX];
  playArea[lastY][lastX] = null;
  updateTrail(lastX, lastY);
  player.movetick = player.maxMoveTick;

  return point;
}

function update() {
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

  if (player.movetick > 0) {
    player.movetick -= 1;
    return;
  }

  for (var i = 0; i < tetrises.length; i++) {
    tetrises[i].update();
  }
  checkForFilledRows();

  var point = false;
  player.dir = player.nextdir;
  if (player.dir == 'u') {
    if (player.y == 0) {
      gameover();
      return;
    }
    point = moveTo(player.x, player.y - 1);
  } else if (player.dir == 'd') {
    if (player.y == playArea.length - 1) {
      gameover();
      return;
    }
    point = moveTo(player.x, player.y + 1);
  } else if (player.dir == 'l') {
    if (player.x == 0) {
      gameover();
      return;
    }
    point = moveTo(player.x - 1, player.y);
  } else if (player.dir == 'r') {
    if (player.x == playArea[0].length - 1) {
      gameover();
      return;
    }
    point = moveTo(player.x + 1, player.y);
  }

  if (point) {
    trail.push({x: player.x, y: player.y});
    tetrises.push(new Tetris(trail));
    spawnPoint();
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
  g.fillText("Score: " + score, (canvas.width / 2) + (playareaSize.w / 2) + 25, 50);

  // Draw play area
  for (var y = 0; y < playArea.length; y++) {
    for (var x = 0; x < playArea[y].length; x++) {
      if (playArea[y][x] != null) {
        playArea[y][x].draw(playareaSize.x + (x * BLOCK_SIZE), playareaSize.y + (y * BLOCK_SIZE), BLOCK_SIZE);
      }
    }
  }

  if (isGameover) {
    // Draw GAME OVER
    g.fillStyle = "#800000";
    text = "GAME OVER";
    g.fillText(text, (canvas.width / 2) - (g.measureText(text).width / 2), 150);
  }
}

function loop() {
  if (!isGameover) {
    update();
  } else if (controls.up || controls.left || controls.right || controls.down) {
    location.reload();
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
    right: false
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
    }
  }, false);
}