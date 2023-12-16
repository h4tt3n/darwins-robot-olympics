
"use strict";

import { Camera } from './camera.js';

class Renderer {
    constructor(canvasId, world) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera(0, 0, 1.0);
        this.world = world;
    }
    draw() {

        // Update camera
        this.camera.update();
        
        // Clear canvas
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgb(64, 80, 96)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.save();
        // this.ctx.translate(this.camera.x, this.camera.y);
        // this.ctx.scale(this.camera.zoom, this.camera.zoom);

        this.ctx.save(); // Save the current context state
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // Translate to the center of the canvas
        this.ctx.scale(this.camera.zoom, this.camera.zoom); // Apply zoom
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y); // Apply position

        // Render world

        // Draw linear springs
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "rgb(192, 192, 192)";
        this.ctx.lineJoin = "round";

        for(let i = 0 ; i < this.world.linearSprings.length ; i++) {
            var linearSpring = this.world.linearSprings[i];
            // var x1 = linearSpring.linearStateA.position.x
            // var y1 = linearSpring.linearStateA.position.y
            // var x2 = linearSpring.linearStateB.position.x
            // var y2 = linearSpring.linearStateB.position.y
            var x1 = linearSpring.pointA.position.x
            var y1 = linearSpring.pointA.position.y
            var x2 = linearSpring.pointB.position.x
            var y2 = linearSpring.pointB.position.y

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Draw particles
        for(let i = 0 ; i < this.world.particles.length ; i++) {
            var particle = this.world.particles[i];
            var x = particle.position.x
            var y = particle.position.y

            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.radius, 0, Math.PI*2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw LinearStates
        for(let i = 0 ; i < this.world.linearStates.length ; i++) {
            var linearState = this.world.linearStates[i];
            var x = linearState.position.x
            var y = linearState.position.y

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI*2);
            this.ctx.fillStyle = "rgb(255, 32, 32)";
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Bullets
        // for(let j = 0 ; j < bullets.length ; j++) {
    
        //     if(bullets[j].isAlive === false ) { continue;}
                
        //     var x = bullets[j].position.x
        //     var y = bullets[j].position.y
        //     //ctx[i].setTransform(1, 0, 0, 1, x, y);
        //     ctx[i].beginPath();
        //     ctx[i].arc(x, y, bulletRadius, 0, Math.PI*2);
        //     ctx[i].fillStyle = "#FFFFFF";
        //     ctx[i].fill();
        //     ctx[i].closePath();
        // }

        // ships
        // for(let j = 0 ; j < ships.length ; j++) {
        //     if(ships[j].isAlive === false) {continue;}
            
        //     var img = images[ships[j].image];
        //     var x = ships[j].position.x
        //     var y = ships[j].position.y
    
        //     ctx[i].save(); // Save the current context state
        //     ctx[i].translate(x, y); // Translate to the ship's position
        //     ctx[i].rotate(ships[j].angle); // Rotate context
        //     ctx[i].drawImage(img, -ships[j].radius * 2, -ships[j].radius, ships[j].radius*4, ships[j].radius*2);
        //     ctx[i].restore(); // Restore the context state
        // }

        this.ctx.restore(); // Restore the context state
    }

}

export { Renderer };