function Point() {
  this.color = "#61D961";

  this.draw = function(x, y, s) {
    g.beginPath();
    var half = s / 2;
    var quart = half / 2;
    g.rect(x + quart, y + quart, half, half);
    g.fillStyle = this.color;
    g.fill();
    g.closePath();
  }
}