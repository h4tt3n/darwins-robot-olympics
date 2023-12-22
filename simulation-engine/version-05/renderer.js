"use strict";

// Version 0.5

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { Camera } from './camera.js';
import { LineSegmentParticleCollision } from '../../physics-engine/version-01/collision/lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from '../../physics-engine/version-01/collision/particleParticleCollision.js';
import { LineSegmentWheelCollision } from '../../physics-engine/version-01/collision/lineSegmentWheelCollision.js';

class Renderer {
    constructor(canvasId, simulation) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight * 0.8;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera(0, 0, 0.7);
        this.simulation = simulation;

        // this.image = new Image();
        // this.image.src = "../../assets/darwins-robot-olympics-logo-380-x-380-01.png";
    }
    update() {
        if (this.simulation.isInitiated) {
            // Render simulation
            this.draw();
        } else {
            // Render welcome screen
            this.welcomeScreen();
        }
    }
    welcomeScreen() {
        // Clear canvas
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.textAlign = "start";
        this.ctx.textBaseline = "alphabetic";
        
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.font = "italic 24px Arial";
        this.ctx.fillText("Welcome to...", 40, 60);
        this.ctx.font = "italic bold 64px Arial";
        this.ctx.fillText("Darwin's Robot Olympics", 20, 120);
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.font = "italic 26px Arial";
        this.ctx.fillText("Play and experiment with evolving, challenge-solving robots", 20, 170);
        
        
        
        this.ctx.fillStyle = "rgb(128, 128, 128)";
        this.ctx.font = "18px Arial";
        this.ctx.fillText("Version 0.1.0 beta", this.canvas.width-240, this.canvas.height-20);

        //this.ctx.drawImage(this.image, this.canvas.width - 350, 50, 300, 300);

    }
    draw() {

        if (this.simulation.followSelectedCreature && this.simulation.selectedCreature) {
            this.camera.restPosition = this.simulation.selectedCreature.body.particles[0].position;

        }
        // // Make camera follow roboworm
        // if (this.simulation.roboWorms.length > 0) {
        //     this.camera.restPosition = this.simulation.roboWorms[0].body.particles[0].position;
        // }

        // if (this.simulation.roboCrabs.length > 0) {
        //     this.camera.restPosition = this.simulation.roboCrabs[0].body.particles[0].position;
        // }

        // Update camera
        this.camera.update();

        // Clear canvas
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgb(64, 80, 96)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save(); // Save the current context state
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // Translate to the center of the canvas
        this.ctx.scale(this.camera.zoom, this.camera.zoom); // Apply zoom
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y); // Apply position

        // Render simulation

        // Global settings
        this.ctx.lineCap = "round";

        // Draw rays
        if (this.simulation.renderRaycasts) {

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "rgb(255, 255, 255)";

            for (let i = 0; i < this.simulation.rays.length; i++) {
                var ray = this.simulation.rays[i];
                var x1 = ray.origin.x;
                var y1 = ray.origin.y;

                // Render origin
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();

                var intersection = ray.closestIntersection;

                if (intersection) {

                    var x2 = intersection.intersection.point.x
                    var y2 = intersection.intersection.point.y

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    this.ctx.closePath();

                    // this.ctx.beginPath();
                    // this.ctx.arc(x2, y2, 2, 0, Math.PI*2);
                    // this.ctx.fillStyle = "rgb(255, 255, 255)";
                    // this.ctx.fill();
                }
            }

            // Draw rayCameras
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "rgb(255, 255, 255)";
            //this.ctx.lineJoin = "round";

            for (let i = 0; i < this.simulation.rayCameras.length; i++) {
                var rayCamera = this.simulation.rayCameras[i];
                var x1 = rayCamera.origin.x;
                var y1 = rayCamera.origin.y;

                // Render origin
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();

                var intersections = rayCamera.closestIntersections;

                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {

                        if (intersections[j] && intersections[j].intersection && intersections[j].intersection.point) {  // temporary bugfix

                            var x2 = intersections[j].intersection.point.x;
                            var y2 = intersections[j].intersection.point.y;

                            this.ctx.beginPath();
                            this.ctx.moveTo(x1, y1);
                            this.ctx.lineTo(x2, y2);
                            this.ctx.stroke();
                            this.ctx.closePath();

                            // this.ctx.beginPath();
                            // this.ctx.arc(x2, y2, 2, 0, Math.PI*2);
                            // this.ctx.fillStyle = "rgb(255, 255, 255)";
                            // this.ctx.fill();
                        }

                    }
                }
            }
        }

        // Draw RoboWorms
        for (let i = 0; i < this.simulation.roboWorms.length; i++) {
            var roboWorm = this.simulation.roboWorms[i];

            // Draw linear springs
            for (let j = 0; j < roboWorm.body.linearSprings.length; j++) {
                var linearSpring = roboWorm.body.linearSprings[j];

                var x1 = linearSpring.pointA.position.x;
                var y1 = linearSpring.pointA.position.y;
                var x2 = linearSpring.pointB.position.x;
                var y2 = linearSpring.pointB.position.y;

                this.ctx.lineWidth = linearSpring.radius * 2;
                this.ctx.strokeStyle = linearSpring.color;
                //console.log(linearSpring.color);

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            // Draw body
            for (let j = 0; j < roboWorm.body.particles.length; j++) {
                var particle = roboWorm.body.particles[j];
                var x = particle.position.x;
                var y = particle.position.y;

                this.ctx.beginPath();
                this.ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
                this.ctx.closePath();
            }

            // Draw wheels
            if (roboWorm.body.wheels) {

                this.ctx.lineWidth = 8;
                this.ctx.strokeStyle = "rgb(192, 192, 192)";

                for (let i = 0; i < this.simulation.world.wheels.length; i++) {
                    var wheel = this.simulation.world.wheels[i];
                    var x = wheel.position.x;
                    var y = wheel.position.y;
                    var r = wheel.radius * 0.5;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, wheel.radius, 0, Math.PI * 2);
                    //this.ctx.fillStyle = wheel.color;
                    this.ctx.stroke();
                    this.ctx.closePath();

                    var pos = wheel.position;

                    // Light gray line in direction of angle
                    var x2 = pos.x + wheel.angleVector.x * r;
                    var y2 = pos.y + wheel.angleVector.y * r;
                    var direction = new Vector2(x2 - x, y2 - y);

                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.strokeStyle = "rgb(192, 192, 192)";
                    this.ctx.stroke();
                    this.ctx.closePath();

                    // Green line in direction of right perpendicular of angle
                    var right = pos.add(wheel.angleVector.perp().mul(r));

                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(right.x, right.y);
                    this.ctx.strokeStyle = "rgb(32, 255, 32)";
                    this.ctx.stroke();
                    this.ctx.closePath();

                    // Red line in direction of left perpendicular of angle
                    var right = pos.add(wheel.angleVector.perp().mul(-r));

                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(right.x, right.y);
                    this.ctx.strokeStyle = "rgb(255, 32, 32)";
                    this.ctx.stroke();
                    this.ctx.closePath();

                    // Dot in center
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
                    this.ctx.fillStyle = "rgb(128, 128, 128)";
                    this.ctx.fill();
                    this.ctx.closePath();
                }

            }

            // Write index above head
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(i, roboWorm.body.particles[0].position.x-12, roboWorm.body.particles[0].position.y-40);
            //this.ctx.fillText(Math.floor(roboWorm.averagePosition), roboWorm.body.particles[0].position.x-12, roboWorm.body.particles[0].position.y-80);
        }

        // Draw RoboCrabs
        for (let i = 0; i < this.simulation.roboCrabs.length; i++) {
            var roboCrab = this.simulation.roboCrabs[i];

            // Draw linear springs
            for (let j = 0; j < roboCrab.body.linearSprings.length; j++) {
                var linearSpring = roboCrab.body.linearSprings[j];

                var x1 = linearSpring.pointA.position.x;
                var y1 = linearSpring.pointA.position.y;
                var x2 = linearSpring.pointB.position.x;
                var y2 = linearSpring.pointB.position.y;

                this.ctx.lineWidth = linearSpring.radius * 2;
                this.ctx.strokeStyle = linearSpring.color;
                //console.log(linearSpring.color);

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            // Draw body
            for (let j = 0; j < roboCrab.body.particles.length; j++) {
                var particle = roboCrab.body.particles[j];
                var x = particle.position.x;
                var y = particle.position.y;

                this.ctx.beginPath();
                this.ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
                this.ctx.closePath();
            }

            // Write index above head
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(i, roboCrab.body.particles[0].position.x-12, roboCrab.body.particles[0].position.y-40);
            //this.ctx.fillText(i, roboCrab.body.particles[0].position.x-12, 0);

        }

        // Draw RoboStarfishes
        for (let i = 0; i < this.simulation.roboStarfishes.length; i++) {

            var roboStarfish = this.simulation.roboStarfishes[i];

            // Draw linear springs
            for (let j = 0; j < roboStarfish.body.linearSprings.length; j++) {
                var linearSpring = roboStarfish.body.linearSprings[j];

                var x1 = linearSpring.pointA.position.x;
                var y1 = linearSpring.pointA.position.y;
                var x2 = linearSpring.pointB.position.x;
                var y2 = linearSpring.pointB.position.y;

                this.ctx.lineWidth = linearSpring.radius * 2;
                this.ctx.strokeStyle = linearSpring.color;
                //console.log(linearSpring.color);

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            // Draw body
            for (let j = 0; j < roboStarfish.body.particles.length; j++) {
                var particle = roboStarfish.body.particles[j];
                var x = particle.position.x;
                var y = particle.position.y;

                this.ctx.beginPath();
                this.ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
                this.ctx.closePath();
            }

            // Write index above head
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(i, roboStarfish.body.particles[0].position.x-12, roboStarfish.body.particles[0].position.y-40);
            //this.ctx.fillText(i, roboStarfish.body.particles[0].position.x-12, 0);

        }

        // Draw waypoints
        for (let i = 0; i < this.simulation.wayPoints.length; i++) {
            var wayPoint = this.simulation.wayPoints[i];
            var x = wayPoint.position.x;
            var y = wayPoint.position.y;

            this.ctx.beginPath();
            this.ctx.arc(x, y, wayPoint.radius * 1.0, 0, Math.PI * 2);
            this.ctx.fillStyle = "white";
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.arc(x, y, wayPoint.radius * 0.8, 0, Math.PI * 2);
            this.ctx.fillStyle = "blue";
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.arc(x, y, wayPoint.radius * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = "white";
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.arc(x, y, wayPoint.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = "red";
            this.ctx.fill();
            this.ctx.closePath();

            // Write index above waypoint
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(i+1, x-6, y-wayPoint.radius-16);

        }

        // Draw linear springs
        //this.ctx.strokeStyle = "rgb(192, 192, 192)";

        // Draw linear springs
        // for (let i = 0; i < this.simulation.world.linearSprings.length; i++) {
        //     var linearSpring = this.simulation.world.linearSprings[i];

        //     var x1 = linearSpring.pointA.position.x;
        //     var y1 = linearSpring.pointA.position.y;
        //     var x2 = linearSpring.pointB.position.x;
        //     var y2 = linearSpring.pointB.position.y;

        //     this.ctx.lineWidth = linearSpring.radius * 2;
        //     this.ctx.strokeStyle = linearSpring.color;

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(x1, y1);
        //     this.ctx.lineTo(x2, y2);
        //     this.ctx.stroke();
        //     this.ctx.closePath();
        // }

        // Draw LineSegments
        this.ctx.strokeStyle = "rgb(140, 140, 140)";

        for (let i = 0; i < this.simulation.world.lineSegments.length; i++) {
            var lineSegment = this.simulation.world.lineSegments[i];
            var x1 = lineSegment.pointA.position.x;
            var y1 = lineSegment.pointA.position.y;
            var x2 = lineSegment.pointB.position.x;
            var y2 = lineSegment.pointB.position.y;

            this.ctx.lineWidth = lineSegment.radius * 2;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Draw Points
        for (let i = 0; i < this.simulation.world.points.length; i++) {
            var point = this.simulation.world.points[i];
            var x = point.position.x;
            var y = point.position.y;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(192, 192, 192)";
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw particles
        // this.ctx.lineWidth = 1;
        // this.ctx.strokeStyle = "rgb(192, 192, 192)";
        // //this.ctx.lineJoin = "round";

        // for (let i = 0; i < this.simulation.world.particles.length; i++) {
        //     var particle = this.simulation.world.particles[i];
        //     var x = particle.position.x;
        //     var y = particle.position.y;

        //     this.ctx.beginPath();
        //     this.ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        //     this.ctx.fillStyle = particle.color;
        //     this.ctx.fill();
        //     this.ctx.closePath();
        // }

        // Draw wheels
        // this.ctx.lineWidth = 8;
        // this.ctx.strokeStyle = "rgb(192, 192, 192)";

        // for (let i = 0; i < this.simulation.world.wheels.length; i++) {
        //     var wheel = this.simulation.world.wheels[i];
        //     var x = wheel.position.x;
        //     var y = wheel.position.y;
        //     var r = wheel.radius * 0.5;

        //     this.ctx.beginPath();
        //     this.ctx.arc(x, y, wheel.radius, 0, Math.PI * 2);
        //     //this.ctx.fillStyle = wheel.color;
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     var pos = wheel.position;

        //     // Light gray line in direction of angle
        //     var x2 = pos.x + wheel.angleVector.x * r;
        //     var y2 = pos.y + wheel.angleVector.y * r;
        //     var direction = new Vector2(x2 - x, y2 - y);

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(pos.x, pos.y);
        //     this.ctx.lineTo(x2, y2);
        //     this.ctx.strokeStyle = "rgb(192, 192, 192)";
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     // Green line in direction of right perpendicular of angle
        //     var right = pos.add(wheel.angleVector.perp().mul(r));

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(pos.x, pos.y);
        //     this.ctx.lineTo(right.x, right.y);
        //     this.ctx.strokeStyle = "rgb(32, 255, 32)";
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     // Red line in direction of left perpendicular of angle
        //     var right = pos.add(wheel.angleVector.perp().mul(-r));

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(pos.x, pos.y);
        //     this.ctx.lineTo(right.x, right.y);
        //     this.ctx.strokeStyle = "rgb(255, 32, 32)";
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     // Dot in center
        //     this.ctx.beginPath();
        //     this.ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        //     this.ctx.fillStyle = "rgb(128, 128, 128)";
        //     this.ctx.fill();
        //     this.ctx.closePath();
        // }

        // Draw LinearStates
        for (let i = 0; i < this.simulation.world.linearStates.length; i++) {
            var linearState = this.simulation.world.linearStates[i];
            var x = linearState.position.x;
            var y = linearState.position.y;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(255, 32, 32)";
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw AngularStates
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "rgb(192, 192, 192)";
        //this.ctx.lineJoin = "round";

        for (let i = 0; i < this.simulation.world.angularStates.length; i++) {
            var angularState = this.simulation.world.angularStates[i];

            var pos = angularState.position;

            // Light gray line in direction of angle
            var x2 = pos.x + angularState.angleVector.x * 16;
            var y2 = pos.y + angularState.angleVector.y * 16;
            var direction = new Vector2(x2 - x, y2 - y);

            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = "rgb(192, 192, 192)";
            this.ctx.stroke();
            this.ctx.closePath();

            // Green line in direction of right perpendicular of angle
            var right = pos.add(angularState.angleVector.perp().mul(16));

            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(right.x, right.y);
            this.ctx.strokeStyle = "rgb(32, 255, 32)";
            this.ctx.stroke();
            this.ctx.closePath();

            // Red line in direction of left perpendicular of angle
            var right = pos.add(angularState.angleVector.perp().mul(-16));

            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(right.x, right.y);
            this.ctx.strokeStyle = "rgb(255, 32, 32)";
            this.ctx.stroke();
            this.ctx.closePath();

            // Dot in center
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(128, 128, 128)";
            this.ctx.fill();
            this.ctx.closePath();

        }

        // Draw lineSegmentParticleCollisions for debugging

        for (let i = 0; i < this.simulation.world.collisions.size; i++) {
            const keys = Array.from(this.simulation.world.collisions.keys());
            // Get collision
            if (this.simulation.world.collisions.get(keys[i]) instanceof LineSegmentParticleCollision) {
                    
                let collision = this.simulation.world.collisions.get(keys[i]);

                // Draw collision points
                this.ctx.beginPath();
                this.ctx.arc(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.arc(collision.particleCollisionPoint.x, collision.particleCollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();
                this.ctx.closePath();

                // Draw line between collision points
                this.ctx.beginPath();
                this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
                this.ctx.lineTo(collision.particleCollisionPoint.x, collision.particleCollisionPoint.y);
                this.ctx.strokeStyle = "rgb(255, 255, 255)";
                this.ctx.stroke();
                this.ctx.closePath();
                
                // var deltaPosition = collision.particleCollisionPoint.sub(collision.lineSegmentCollisionPoint);
                // var deltaVelocity = particle3.velocity;
                // var positionError = collision.normal.dot(deltaPosition);
                // var velocityError = collision.normal.dot(deltaVelocity);
                // var restImpulse = -(positionError * 1.0 * 60 + velocityError * 1.0);
                // particle3.addImpulse(collision.normal.mul(restImpulse));
                //console.log({deltaPosition : deltaPosition, deltaVelocity : deltaVelocity, positionError : positionError, velocityError : velocityError, restImpulse : restImpulse});
            }
        }

        // Draw ParticleParticleCollisions for debugging

        for (let i = 0; i < this.simulation.world.collisions.size; i++) {
            const keys = Array.from(this.simulation.world.collisions.keys());
            // Get collision
            if (this.simulation.world.collisions.get(keys[i]) instanceof ParticleParticleCollision) {

                let collision = this.simulation.world.collisions.get(keys[i]);

                // Draw collision points
                this.ctx.beginPath();
                this.ctx.arc(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.arc(collision.particleBCollisionPoint.x, collision.particleBCollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.moveTo(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y);
                this.ctx.lineTo(collision.particleACollisionPoint.x - collision.normal.x * collision.distance, collision.particleACollisionPoint.y - collision.normal.y * collision.distance);
                this.ctx.strokeStyle = "rgb(255, 255, 255)";
                this.ctx.stroke();
                this.ctx.closePath();
                
                // Draw line between collision points
                // this.ctx.beginPath();
                // this.ctx.moveTo(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y);
                // this.ctx.lineTo(collision.particleBCollisionPoint.x, collision.particleBCollisionPoint.y);
                // this.ctx.strokeStyle = "rgb(255, 255, 255)";
                // this.ctx.stroke();
                // this.ctx.closePath();
            }
        }

        // Draw LineSegmetLinearSpringCollisions for debugging
        // for (let i = 0; i < this.simulation.world.collisions.size; i++) {
        //     const keys = Array.from(this.simulation.world.collisions.keys());
        //     //console.log(this.simulation.world.collisions.get(keys[i]))
        //     if (this.simulation.world.collisions.get(keys[i]) instanceof LineSegmentLinearSpringCollision) {
                    
        //         let collision = this.simulation.world.collisions.get(keys[i]);

        //         // Draw collision points
        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 0, 0)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.linearSpringCollisionPoint.position.x, collision.linearSpringCollisionPoint.position.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(0, 255, 0)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         // Draw collsion normal as line
        //         // this.ctx.beginPath();
        //         // this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
        //         // this.ctx.lineTo(collision.lineSegmentCollisionPoint.x+collision.normal.x * 100, collision.lineSegmentCollisionPoint.y+collision.normal.y * 100);
        //         // this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         // this.ctx.stroke();
        //         // this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
        //         this.ctx.lineTo(collision.linearSpringCollisionPoint.position.x, collision.linearSpringCollisionPoint.position.y);
        //         this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         this.ctx.stroke();
        //         this.ctx.closePath();
        //     }
        // }

        // Draw LineSegmetWheelCollisions for debugging
        for (let i = 0; i < this.simulation.world.collisions.size; i++) {
            const keys = Array.from(this.simulation.world.collisions.keys());
            //console.log(this.simulation.world.collisions.get(keys[i]))
            if (this.simulation.world.collisions.get(keys[i]) instanceof LineSegmentWheelCollision) {

                let collision = this.simulation.world.collisions.get(keys[i]);

                // Draw collision points
                this.ctx.beginPath();
                this.ctx.arc(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 0, 0)";
                this.ctx.fill();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.arc(collision.wheelCollisionPoint.x, collision.wheelCollisionPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(0, 255, 0)";
                this.ctx.fill();
                this.ctx.closePath();

                // Draw collsion normal as line
                // this.ctx.beginPath();
                // this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
                // this.ctx.lineTo(collision.lineSegmentCollisionPoint.x+collision.normal.x * 100, collision.lineSegmentCollisionPoint.y+collision.normal.y * 100);
                // this.ctx.strokeStyle = "rgb(255, 255, 255)";
                // this.ctx.stroke();
                // this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
                this.ctx.lineTo(collision.wheelCollisionPoint.x, collision.wheelCollisionPoint.y);
                this.ctx.strokeStyle = "rgb(255, 255, 255)";
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }

        this.ctx.restore(); // Restore the context state

        // Render info in top-left corner of screen
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillText("Generation: " + this.simulation.generation, 10, 30);
        this.ctx.fillText("Ticks: " + this.simulation.generationTicks + " / " + this.simulation.generationsMaxTicks, 10, 60);

        // Render "Paused" in center of screen if simulation is paused
        if (this.simulation.isPaused) {
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText("Paused", this.canvas.width / 2 - 60, 40);
        }
    }
}

export { Renderer };