function Controls() {
  this.handler_keyUp = function(e) {
    switch(e.keyCode) {
    case 38:
      this.up = false;
      break;
    case 40:
      this.down = false;
      break;
    }
  }.bind(this);

  this.handler_keyDown = function(e) {
    switch(e.keyCode) {
    case 38:
      this.up = true;
      break;
    case 40:
      this.down = true;
      break;
    }
  }.bind(this);
}

function controls_init(c) {
  document.addEventListener('keydown', c.handler_keyDown, false);
  document.addEventListener('keyup', c.handler_keyUp, false);
}