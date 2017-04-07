function Wall(x, y, w, h, turnDir) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.turn = turnDir;

  this.draw = function() {
    g.beginPath();
    g.rect(this.x, this.y, this.w, this.h);
    g.fillStyle = "#777";
    g.fill();
    g.closePath();
  }
}