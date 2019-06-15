function Point() {
  this.color = "#61D961";

  this.draw = function(x, y, s) {
    g.beginPath();
    let half = s / 2;
    let quart = half / 2;
    g.rect(x + quart, y + quart, half, half);
    g.fillStyle = this.color;
    g.fill();
    g.closePath();
  }
}