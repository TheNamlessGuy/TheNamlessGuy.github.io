let canvas;
let g;
let paddle;
let controls;
let balls = [];
let walls = [];

let startTime = 0;
let maxBalls = 1;

function filterBalls() {
  let i = 0;
  while (i < balls.length) {
    if (!balls[i].collidesWith({ x: -15, y: 0, w: canvas.width, h: canvas.height })) {
      balls.splice(i, 1);
    } else { i++; }
  }
}

function update() {
  paddle.update(controls);
  for (let i in balls) {
    if (balls[i].update(paddle, walls)) {
      // if hit paddle
      spawnBall();
    }
  }
  filterBalls();
  if (balls.length === 0) {
    alert('LOSE! Your final score:\n\nTime: ' + Math.ceil(Math.abs(new Date().getTime() - startTime) / (1000)) + " seconds \nMax balls: " + maxBalls);
    document.location.reload();
  }
}

function draw() {
  g.clearRect(0, 0, canvas.width, canvas.height);

  paddle.draw();
  for (let w in walls) { walls[w].draw(); }

  g.fillStyle = "#fff";
  let text = "Time alive: " + Math.ceil(Math.abs(new Date().getTime() - startTime) / (1000));
  g.fillText(text, (canvas.width - g.measureText(text).width) / 2, 70);
  text = "Maximum balls alive: " + maxBalls;
  g.fillText(text, (canvas.width - g.measureText(text).width) / 2, 150);

  for (let b in balls) { balls[b].draw(); }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function spawnBall() {
  let y = 0;
  do {
    y = rand(50, canvas.height - 50);
  } while (y >= paddle.y - 10 && y <= paddle.y + paddle.h + 10);

  let speed = rand(5, 10);
  let size = 15 - speed;
  let dy = either(-speed, speed);

  balls.push(new Ball(-size, y, size, speed, dy));

  if (balls.length > maxBalls) maxBalls = balls.length;
}

window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  g = canvas.getContext('2d');

  paddle = new Paddle();
  spawnBall();

  let wallThick = 25;
  // Y-walls
  walls.push(new Wall(0, 0, canvas.width, wallThick, 'y'));
  walls.push(new Wall(0, canvas.height - wallThick, canvas.width, wallThick, 'y'));
  // X-walls
  walls.push(new Wall(canvas.width - wallThick, 0, wallThick, canvas.height, 'x'));

  controls = new Controls();
  controls_init(controls);

  g.translate(0.5, 0.5);
  g.font = "48px Arial";
  g.imageSmoothingEnabled = true;
  startTime = new Date().getTime();
  loop();
}