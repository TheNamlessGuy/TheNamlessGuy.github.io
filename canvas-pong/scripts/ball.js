function Ball(x, y, size, dx, dy) {
  this.x = x;
  this.y = y;
  this.size = size;

  this.color = "#0095DD";
  switch(dx) {
  case 5:
    this.color = "#FF0";
    break;
  case 6:
    this.color = "#FC9";
    break;
  case 7:
    this.color = "#F93";
    break;
  case 8:
    this.color = "#F66";
    break;
  case 9:
    this.color = "#F33";
    break;
  case 10:
    this.color = "#900";
    break;
  }

  this.dx = dx,
  this.dy = -dy,

  this.collidesWith = function(obj) {
    return (this.x >= obj.x && this.x <= obj.x + obj.w) && (this.y >= obj.y && this.y <= obj.y + obj.h);
  }

  this.update = function(paddle, walls) {
    var hitPaddle = false;
    for (var i in walls) {
      if (this.collidesWith(walls[i])) {
        this.turn(walls[i].turn);
      }
    }
    if (this.collidesWith(paddle)) {
      hitPaddle = true;
      this.turn(paddle.turn);
    }

    this.x += this.dx;
    this.y += this.dy;
    return hitPaddle;
  };

  this.turn = function(dir) {
    if (dir === 'x') {
      this.dx = -this.dx;
    } else {
      this.dy = -this.dy;
    }
  }

  this.draw = function() {
    g.beginPath();
    g.arc(this.x, this.y, this.size, 0, this.size);
    g.fillStyle = this.color;
    g.fill();
    g.closePath();
  };
}