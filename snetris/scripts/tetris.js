function Tetris(locations) {
  this.color = Tetris.colors[rand(0, Tetris.colors.length - 1)];
  this.locations = [];
  for (let i = 0; i < locations.length; i++) {
    this.locations.push({x: locations[i].x, y: locations[i].y});
    playArea[locations[i].y][locations[i].x][TETRIS_Z] = playArea[locations[i].y][locations[i].x][PLAYER_Z];
    playArea[locations[i].y][locations[i].x][PLAYER_Z] = null;
    playArea[locations[i].y][locations[i].x][TETRIS_Z].color = this.color;
  }

  this.locations.sort((a, b) => {
    return b.y - a.y;
  });

  this.collision = function(x, y) {
    if (playArea[y][x][TETRIS_Z] == null && playArea[y][x][PLAYER_Z] == null) {
      return false;
    }
    for (let i = 0; i < this.locations.length; i++) {
      if (this.locations[i].x == x && this.locations[i].y == y) {
        return false;
      }
    }
    return true; // Blocked by another tetris, or the player
  }

  this.update = function() {
    let falling = true;
    for (let i = 0; i < this.locations.length; i++) {
      playArea[this.locations[i].y][this.locations[i].x][TETRIS_Z].falling = false;
      if (this.locations[i].y == playArea.length - 1 || this.collision(this.locations[i].x, this.locations[i].y + 1)) {
        falling = false;
      }
    }

    if (!falling) {
      return;
    }

    for (let i = 0; i < this.locations.length; i++) {
      playArea[this.locations[i].y][this.locations[i].x][TETRIS_Z].falling = true;
      let oldY = this.locations[i].y;
      this.locations[i].y += 1;
      playArea[this.locations[i].y][this.locations[i].x][TETRIS_Z] = playArea[oldY][this.locations[i].x][TETRIS_Z];
      playArea[oldY][this.locations[i].x][TETRIS_Z] = null;
    }
  }

  this.remove = function(x, y) {
    for (let i = 0; i < this.locations.length; i++) {
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