function Block(color) {
  this.color = color;
  this.falling = false;

  this.draw = function(x, y, s) {
    g.beginPath();
    g.rect(x, y, s, s);
    g.fillStyle = this.color;
    g.fill();
    g.closePath();
  }
}