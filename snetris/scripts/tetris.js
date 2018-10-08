function Tetris(locations) {
  this.color = Tetris.colors[rand(0, Tetris.colors.length - 1)];
  this.locations = [];
  for (var i = 0; i < locations.length; i++) {
    this.locations.push({x: locations[i].x, y: locations[i].y});
  }

  this.locations.sort((a, b) => {
    return b.y - a.y;
  });

  for (var i = 0; i < this.locations.length; i++) {
    playArea[this.locations[i].y][this.locations[i].x].color = this.color;
  }

  this.collision = function(x, y) {
    if (playArea[y][x] == null) {
      return false;
    }
    for (var i = 0; i < this.locations.length; i++) {
      if (this.locations[i].x == x && this.locations[i].y == y) {
        return false;
      }
    }
    return true;
  }

  this.update = function() {
    var falling = true;
    for (var i = 0; i < this.locations.length; i++) {
      playArea[this.locations[i].y][this.locations[i].x].falling = false;
      if (this.locations[i].y == playArea.length - 1 || this.collision(this.locations[i].x, this.locations[i].y + 1)) {
        falling = false;
      }
    }

    if (!falling) {
      return;
    }

    for (var i = 0; i < this.locations.length; i++) {
      playArea[this.locations[i].y][this.locations[i].x].falling = true;
      var oldY = this.locations[i].y;
      this.locations[i].y += 1;
      playArea[this.locations[i].y][this.locations[i].x] = playArea[oldY][this.locations[i].x];
      playArea[oldY][this.locations[i].x] = null;
    }
  }

  this.remove = function(x, y) {
    for (var i = 0; i < this.locations.length; i++) {
      if (this.locations[i].x == x && this.locations[i].y == y) {
        this.locations.splice(i, 1);
        break;
      }
    }
  }
}

Tetris.colors = [
  "#584CA9",
  "#F04C26",
  "#6D9126",
  "#6D00FF",
  "#FF00FF",
  "#0000FF",
  "#00FFFF",
  "#FFFFFF"
];