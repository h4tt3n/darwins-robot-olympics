"use strict";

// Version 0.5

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { Camera } from './camera.js';
import { LineSegmentParticleCollision } from '../../physics-engine/version-01/collision/lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from '../../physics-engine/version-01/collision/particleParticleCollision.js';
import { LineSegmentWheelCollision } from '../../physics-engine/version-01/collision/lineSegmentWheelCollision.js';
import { Particle } from '../../physics-engine/version-01/particle.js';
import { Wheel } from '../../physics-engine/version-01/wheel.js';
import { FixedSpring } from '../../physics-engine/version-01/fixedSpring.js';
import { LinearSpring } from '../../physics-engine/version-01/linearSpring.js';
import { draw } from '../../draw-logo/version-02/script.js'

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
        
        // // Version and copyright
        // this.ctx.fillStyle = "rgb(128, 128, 128)";
        // this.ctx.font = "14px Arial";
        // this.ctx.fillText("Version 0.1.0 beta - 08.01.2024", 20, this.canvas.height-40);
        // this.ctx.fillText("Copyright \u00A9 Michael Schmidt Nissen", 20, this.canvas.height-20);

        // Render logo
        this.ctx.translate(240, 200);
        this.ctx.scale(0.8, 0.8);
    
        draw();

        // Reset transform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    draw() {

        if (this.simulation.followSelectedCreature && this.simulation.selectedCreature) {
            this.camera.restPosition = this.simulation.selectedCreature.body.particles[0].position;

        }
        // // Make camera follow robot
        // if (this.simulation.robots.length > 0) {
        //     this.camera.restPosition = this.simulation.robots[0].body.particles[0].position;
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

        // Draw robots from map
        if (this.simulation.robots != undefined) {
            for (let i = this.simulation.robots.length-1; i >= 0; i--) {
                var robot = this.simulation.robots[i];

                //console.log(robot.body instanceof Map);

                if (robot.body instanceof Map == false) { break; }

                // Draw LinearSprings
                robot.body.forEach((value) => {
                    if(value instanceof LinearSpring) {
                        var x1 = value.pointA.position.x;
                        var y1 = value.pointA.position.y;
                        var x2 = value.pointB.position.x;
                        var y2 = value.pointB.position.y;

                        this.ctx.lineWidth = value.radius * 2;
                        this.ctx.strokeStyle = value.color;

                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                });

                // Draw FixedSprings
                robot.body.forEach((value) => {
                    if(value instanceof FixedSpring) {
                        var x1 = value.pointA.position.x;
                        var y1 = value.pointA.position.y;
                        var x2 = value.pointB.position.x;
                        var y2 = value.pointB.position.y;

                        this.ctx.lineWidth = value.radius * 2;
                        this.ctx.strokeStyle = value.color;

                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                });

                // Draw particles
                robot.body.forEach((value) => {
                    if(value instanceof Particle) {
                        var x = value.position.x;
                        var y = value.position.y;

                        this.ctx.beginPath();
                        this.ctx.arc(x, y, value.radius, 0, Math.PI * 2);
                        this.ctx.fillStyle = value.color;
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                });

                this.ctx.lineWidth = 10;
                this.ctx.strokeStyle = "rgb(192, 192, 192)";

                // Draw wheels
                robot.body.forEach((value) => {
                    if(value instanceof Wheel) {
                        var x = value.position.x;
                        var y = value.position.y;
                        var r = value.radius * 0.5;

                        this.ctx.beginPath();
                        this.ctx.arc(x, y, value.radius - 5, 0, Math.PI * 2);
                        this.ctx.strokeStyle = value.color;
                        this.ctx.stroke();
                        this.ctx.closePath();

                        var pos = value.position;

                        // Light gray line in direction of angle
                        var x2 = pos.x + value.angleVector.x * r;
                        var y2 = pos.y + value.angleVector.y * r;

                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.strokeStyle = "rgb(192, 192, 192)";
                        this.ctx.stroke();
                        this.ctx.closePath();

                        // Green line in direction of right perpendicular of angle
                        var right = pos.add(value.angleVector.perp().mul(r));

                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(right.x, right.y);
                        this.ctx.strokeStyle = "rgb(32, 255, 32)";
                        this.ctx.stroke();
                        this.ctx.closePath();

                        // Red line in direction of left perpendicular of angle
                        var left = pos.add(value.angleVector.perp().mul(-r));

                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(left.x, left.y);
                        this.ctx.strokeStyle = "rgb(255, 32, 32)";
                        this.ctx.stroke();
                        this.ctx.closePath();

                        // Dot in center
                        this.ctx.beginPath();
                        this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
                        this.ctx.fillStyle = value.color;
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                });
            }
        }

        // Draw robots
        for (let i = this.simulation.robots.length-1; i >= 0; i--) {
            var robot = this.simulation.robots[i];

            // Draw FixedSprings
            if(robot.body.fixedSprings != undefined) {
                for (let j = 0; j < robot.body.fixedSprings.length; j++) {
                    var fixedSpring = robot.body.fixedSprings[j];

                    var x1 = fixedSpring.pointA.position.x;
                    var y1 = fixedSpring.pointA.position.y;
                    var x2 = fixedSpring.pointB.position.x;
                    var y2 = fixedSpring.pointB.position.y;

                    this.ctx.lineWidth = fixedSpring.radius * 2;
                    this.ctx.strokeStyle = fixedSpring.color;

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }

            // Draw linear springs
            if(robot.body.linearSprings != undefined) {
                for (let j = 0; j < robot.body.linearSprings.length; j++) {
                    var linearSpring = robot.body.linearSprings[j];

                    var x1 = linearSpring.pointA.position.x;
                    var y1 = linearSpring.pointA.position.y;
                    var x2 = linearSpring.pointB.position.x;
                    var y2 = linearSpring.pointB.position.y;

                    this.ctx.lineWidth = linearSpring.radius * 2;
                    this.ctx.strokeStyle = linearSpring.color;

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }

            // Draw particles
            if (robot.body.particles != undefined) {
                for (let j = 0; j < robot.body.particles.length; j++) {
                    var particle = robot.body.particles[j];
                    var x = particle.position.x;
                    var y = particle.position.y;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = particle.color;
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }

            // Draw wheels
            if (robot.body.wheels != undefined) {

                this.ctx.lineWidth = 10;
                this.ctx.strokeStyle = "rgb(192, 192, 192)";

                for (let i = 0; i < robot.body.wheels.length; i++) {
                    var wheel = robot.body.wheels[i];
                    var x = wheel.position.x;
                    var y = wheel.position.y;
                    var r = wheel.radius * 0.5;

                    // Wheel circle
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, wheel.radius - 5, 0, Math.PI * 2);
                    this.ctx.strokeStyle = wheel.color;
                    this.ctx.stroke();
                    this.ctx.closePath();

                    this.renderAngularState(wheel, wheel.radius * 0.5);
                }

            }

            // Write index above head
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            //this.ctx.fillText(i, robot.body.particles[0].position.x-12, robot.body.particles[0].position.y-48);
            //this.ctx.fillText(Math.floor(robot.averagePosition), robot.body.particles[0].position.x-12, robot.body.particles[0].position.y-80);
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
        //     this.renderAngularState(wheel, wheel.radius * 0.5);
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
        // this.ctx.lineWidth = 3;
        // this.ctx.strokeStyle = "rgb(192, 192, 192)";
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "rgb(192, 192, 192)";

        for (let i = 0; i < this.simulation.world.angularStates.length; i++) {
            var angularState = this.simulation.world.angularStates[i];

            this.renderAngularState(angularState, 24);
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
        this.ctx.fillText("Ticks: " + this.simulation.generationTicks + " / " + this.simulation.generationMaxTicks, 10, 60);

        // Render "Paused" in center of screen if simulation is paused
        if (this.simulation.isPaused) {
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText("Paused", this.canvas.width / 2 - 60, 40);
        }
    }

    renderAngularState(angularState, radius) {

        var x = angularState.position.x;
        var y = angularState.position.y;

        // Wheel circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, angularState.radius - 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = angularState.color;
        this.ctx.stroke();
        this.ctx.closePath();

        var pos = angularState.position;

        // Light gray line in direction of angle
        var x2 = pos.x + angularState.angleVector.x * radius;
        var y2 = pos.y + angularState.angleVector.y * radius;

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = "rgb(192, 192, 192)";
        this.ctx.stroke();
        this.ctx.closePath();

        // Green line in direction of right perpendicular of angle
        var right = pos.add(angularState.angleVector.perp().mul(radius));

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(right.x, right.y);
        this.ctx.strokeStyle = "rgb(32, 255, 32)";
        this.ctx.stroke();
        this.ctx.closePath();

        // Red line in direction of left perpendicular of angle
        var left = pos.add(angularState.angleVector.perp().mul(-radius));

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(left.x, left.y);
        this.ctx.strokeStyle = "rgb(255, 32, 32)";
        this.ctx.stroke();
        this.ctx.closePath();

        // Dot in center
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = angularState.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}

export { Renderer };