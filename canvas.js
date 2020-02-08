let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let balls = [];

canvas.width = innerWidth;
canvas.height = innerHeight;


window.addEventListener('resize', ()=>{
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

class ball{
    constructor(radians, radius, color, distance, speed){
        this.x;
        this.y;
        this.radius = radius;
        this.color = color;
        this.radians = radians;
        this.distance = distance;
        this.speed = speed;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    }
    
    calcPos(){
        this.x = innerWidth/2 + Math.cos(this.radians) * this.distance;
        this.y = innerHeight/2 + Math.sin(this.radians) * this.distance;
    }

    addRad(){
        this.radians += this.speed;
        if(this.radians >= Math.PI*2)
            this.radians = 0;
    }
    
}

//'rgb('+Math.floor(Math.random()*0)+','+Math.floor(Math.random()*156)+','+Math.floor(Math.random()*256)+')'
for(let i = 0; i < 500; i++){
    let buffer = new ball(i/10, 3.5, 'rgb(188,244,245)' ,225 + Math.random() * 170, 0.006 + Math.random()/60);
    balls.push(buffer);
}

function animate() {
    requestAnimationFrame(animate);


    ctx.fillStyle = 'rgba(4,0,63,0.05)'/*'rgba(255,255,255,1)'*/;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    balls.forEach(x => {
        x.calcPos();
        x.addRad();
        x.draw();
    });



}
animate();