"use strict";

import { Camera } from './camera.js';

class Renderer {
    constructor(canvasId, simulation) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera(0, 0, 1.0);
        this.simulation = simulation;
        //console.log(this.simulation);
    }
    draw() {

        // this.camera.restPosition.x = this.simulation.world.particles[1].position.x;
        // this.camera.restPosition.y = this.simulation.world.particles[1].position.y;

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

        // Render simulation

        // Draw linear springs
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "rgb(192, 192, 192)";
        this.ctx.lineJoin = "round";

        for(let i = 0 ; i < this.simulation.world.linearSprings.length ; i++) {
            var linearSpring = this.simulation.world.linearSprings[i];
            var x1 = linearSpring.linearStateA.position.x
            var y1 = linearSpring.linearStateA.position.y
            var x2 = linearSpring.linearStateB.position.x
            var y2 = linearSpring.linearStateB.position.y

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Draw particles
        for(let i = 0 ; i < this.simulation.world.particles.length ; i++) {
            var particle = this.simulation.world.particles[i];
            var x = particle.position.x
            var y = particle.position.y

            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.radius, 0, Math.PI*2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw LinearStates
        for(let i = 0 ; i < this.simulation.world.linearStates.length ; i++) {
            var linearState = this.simulation.world.linearStates[i];
            var x = linearState.position.x
            var y = linearState.position.y

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI*2);
            this.ctx.fillStyle = "rgb(255, 32, 32)";
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw rays
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(255, 255, 255, 16)";
        this.ctx.lineJoin = "round";

        for(let i = 0 ; i < this.simulation.rays.length ; i++) {
            var ray = this.simulation.rays[i];
            var x1 = ray.origin.x
            var y1 = ray.origin.y

            // Render origin
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, 3, 0, Math.PI*2);
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fill();

            var intersection = ray.castAll(this.simulation.world.linearSprings);
            if(intersection){

                var x2 = intersection.intersection.point.x
                var y2 = intersection.intersection.point.y

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.arc(x2, y2, 3, 0, Math.PI*2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();
            }
        }

        // Draw rayCameras
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(255, 255, 255)";
        this.ctx.lineJoin = "round";

        for(let i = 0 ; i < this.simulation.rayCameras.length ; i++) {
            var rayCamera = this.simulation.rayCameras[i];
            var x1 = rayCamera.origin.x
            var y1 = rayCamera.origin.y

            // Render origin
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, 3, 0, Math.PI*2);
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fill();

            var intersections = rayCamera.castAll(this.simulation.world.linearSprings);

            if(intersections){
                for (let j = 0; j < intersections.length; j++) {
                       
                    var x2 = intersections[j].intersection.point.x
                    var y2 = intersections[j].intersection.point.y

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    this.ctx.closePath();

                    this.ctx.beginPath();
                    this.ctx.arc(x2, y2, 3, 0, Math.PI*2);
                    this.ctx.fillStyle = "rgb(255, 255, 255)";
                    this.ctx.fill();
                }
            }
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

        // Render info top-left corner of screen
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillText("Generation: " + this.simulation.generation, 10, 30);
        this.ctx.fillText("Generation ticks: " + this.simulation.generationTicks, 10, 60);
    }

}

export { Renderer };