function Paddle() {
	this.x = 0;
	this.w = 25;
	this.h = 150;
	this.y = (canvas.height / 2) - (this.h / 2);

	this.turn = 'x';

	this.speed = 15;
	this.color = "#0F0"

	this.update = function(c) {
		if (c.down && this.y + this.h < canvas.height) this.y += this.speed;
		if (c.up && this.y > 0) this.y -= this.speed;
	};

	this.draw = function() {
		g.beginPath();
		g.rect(this.x, this.y, this.w, this.h);
		g.fillStyle = this.color;
		g.fill();
		g.closePath();
	};
}