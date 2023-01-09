let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let balls = [];

canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

class ball {
  constructor(radians, radius, color, distance, speed) {
    this.x;
    this.y;
    this.radius = radius;
    this.color = color;
    this.radians = radians;
    this.distance = distance;
    this.speed = speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  calcPos() {
    this.x = innerWidth / 2 + Math.cos(this.radians) * this.distance;
    this.y = innerHeight / 2 + Math.sin(this.radians) * this.distance;
  }

  addRad() {
    this.radians += this.speed;
    if (this.radians >= Math.PI * 2) this.radians = 0;
  }
}

for (let i = 0; i < 1000; i++) {
  let buffer = new ball(
    Math.random() * Math.PI * 2,
    1,
    `rgb(${Math.random() * 255},${Math.random() * 255},255)`,
    250 + Math.random() * Math.max(canvas.width, canvas.height),
    0.0005 + Math.random() / 200
  );
  balls.push(buffer);
}

function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(4,0,63,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    ball.calcPos();
    ball.addRad();
    ball.draw();
  });
}
animate();
