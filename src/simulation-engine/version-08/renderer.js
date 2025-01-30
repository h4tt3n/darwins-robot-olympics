"use strict";

// Version 0.5

import { Vector2 } from '../../vector-library/version-02/vector2.js';
import { Camera } from './camera.js';
import { LineSegmentParticleCollision } from '../../physics-engine/version-02/collision/lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from '../../physics-engine/version-02/collision/particleParticleCollision.js';
import { LineSegmentWheelCollision } from '../../physics-engine/version-02/collision/lineSegmentWheelCollision.js';
import { Particle } from '../../physics-engine/version-02/particle.js';
import { Wheel } from '../../physics-engine/version-02/wheel.js';
import { FixedSpring } from '../../physics-engine/version-02/fixedSpring.js';
import { LinearSpring } from '../../physics-engine/version-02/linearSpring.js';
import { draw } from '../../draw-logo/version-02/script.js'

class Renderer {
    constructor(canvasId, simulation) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight; // * 0.8;
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

        // Documentation
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.font = "italic 16px Arial";
        this.ctx.fillText("Please select a robot, a challenge, and a population size, then click start challenge button.", 20, 580);
        this.ctx.fillText("Each robot has a unique neural network that translates input (vision) into movement.", 20, 600);
        this.ctx.fillText("The robots earn points by getting as close to the target as possible.", 20, 620);
        this.ctx.fillText("Every new generation of robots is created from the previous generation.", 20, 640);
        this.ctx.fillText("Use mouse to zoom and pan around in the simulated environment.", 20, 660);
        
        // Version and copyright
        this.ctx.fillStyle = "rgb(128, 128, 128)";
        this.ctx.font = "14px Arial";
        this.ctx.fillText("Version 0.4.0 - 30.01.2025 - Copyright \u00A9 Michael Schmidt Nissen 2023-2025", 20, this.canvas.height * 0.87);

        // Render logo
        this.ctx.translate(240, 200);
        this.ctx.scale(0.8, 0.8);
    
        draw();

        // Reset transform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    draw() {

        // if (this.simulation.followSelectedCreature && this.simulation.selectedCreature) {
        //     this.camera.restPosition = this.simulation.selectedCreature.body.particles[0].position;

        // }
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
        this.ctx.fillStyle = "rgb(64, 96, 128)"; //"rgb(64, 96, 128)" // "rgb(64, 80, 96)"
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
            let wayPoint = this.simulation.wayPoints[i];
            let x = wayPoint.position.x;
            let y = wayPoint.position.y;

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
                let ray = this.simulation.rays[i];
                let x1 = ray.origin.x;
                let y1 = ray.origin.y;

                // Render origin
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();

                let intersection = ray.closestIntersection;

                if (intersection) {

                    let x2 = intersection.intersection.point.x
                    let y2 = intersection.intersection.point.y

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
                let rayCamera = this.simulation.rayCameras[i];
                let x1 = rayCamera.origin.x;
                let y1 = rayCamera.origin.y;

                // Render origin
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgb(255, 255, 255)";
                this.ctx.fill();

                let intersections = rayCamera.closestIntersections;

                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {

                        if (intersections[j] && intersections[j].intersection && intersections[j].intersection.point) {  // temporary bugfix

                            let x2 = intersections[j].intersection.point.x;
                            let y2 = intersections[j].intersection.point.y;

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
                let robot = this.simulation.robots[i];

                //console.log(robot.body instanceof Map);

                if (robot.body instanceof Map == false) { break; }

                // Draw LinearSprings
                robot.body.forEach((value) => {
                    if(value instanceof LinearSpring) {
                        let x1 = value.pointA.position.x;
                        let y1 = value.pointA.position.y;
                        let x2 = value.pointB.position.x;
                        let y2 = value.pointB.position.y;

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
                        let x1 = value.pointA.position.x;
                        let y1 = value.pointA.position.y;
                        let x2 = value.pointB.position.x;
                        let y2 = value.pointB.position.y;

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
                        let x = value.position.x;
                        let y = value.position.y;

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
                        let x = value.position.x;
                        let y = value.position.y;
                        let r = value.radius * 0.5;

                        this.ctx.beginPath();
                        this.ctx.arc(x, y, value.radius - 5, 0, Math.PI * 2);
                        this.ctx.strokeStyle = value.color;
                        this.ctx.stroke();
                        this.ctx.closePath();

                        let pos = value.position;

                        // Light gray line in direction of angle
                        let x2 = pos.x + value.angleVector.x * r;
                        let y2 = pos.y + value.angleVector.y * r;

                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.strokeStyle = "rgb(192, 192, 192)";
                        this.ctx.stroke();
                        this.ctx.closePath();

                        // Green line in direction of right perpendicular of angle
                        let right = pos.add(value.angleVector.perp().mul(r));

                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(right.x, right.y);
                        this.ctx.strokeStyle = "rgb(32, 255, 32)";
                        this.ctx.stroke();
                        this.ctx.closePath();

                        // Red line in direction of left perpendicular of angle
                        let left = pos.add(value.angleVector.perp().mul(-r));

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
            let robot = this.simulation.robots[i];

            // Draw FixedSprings
            if(robot.body.fixedSprings != undefined) {
                for (let j = 0; j < robot.body.fixedSprings.length; j++) {
                    let fixedSpring = robot.body.fixedSprings[j];

                    let x1 = fixedSpring.pointA.position.x;
                    let y1 = fixedSpring.pointA.position.y;
                    let x2 = fixedSpring.pointB.position.x;
                    let y2 = fixedSpring.pointB.position.y;

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
                    let linearSpring = robot.body.linearSprings[j];

                    let x1 = linearSpring.pointA.position.x;
                    let y1 = linearSpring.pointA.position.y;
                    let x2 = linearSpring.pointB.position.x;
                    let y2 = linearSpring.pointB.position.y;

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
                    let particle = robot.body.particles[j];
                    let x = particle.position.x;
                    let y = particle.position.y;

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
                    let wheel = robot.body.wheels[i];
                    let x = wheel.position.x;
                    let y = wheel.position.y;
                    let r = wheel.radius * 0.5;

                    // Wheel circle
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, wheel.radius - 5, 0, Math.PI * 2);
                    this.ctx.strokeStyle = wheel.color;
                    this.ctx.stroke();
                    this.ctx.closePath();

                    this.renderAngularState(wheel, wheel.radius * 0.5);
                }
            }

            // Draw angularStates
            if (robot.body.angularStates != undefined) {
                for (let j = 0; j < robot.body.angularStates.length; j++) {
                    let angularState = robot.body.angularStates[j];

                    this.renderAngularState(angularState, 24);
                }
            }


            // Write index above head
            this.ctx.font = "24px Arial";
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(i, robot.body.particles[0].position.x-12, robot.body.particles[0].position.y-48);
            //this.ctx.fillText(Math.floor(robot.averagePosition), robot.body.particles[0].position.x-12, robot.body.particles[0].position.y-80);
        }

        // Draw linear springs
        //this.ctx.strokeStyle = "rgb(192, 192, 192)";

        // Draw linear springs
        // for (let i = 0; i < this.simulation.world.linearSprings.length; i++) {
        //     let linearSpring = this.simulation.world.linearSprings[i];

        //     let x1 = linearSpring.pointA.position.x;
        //     let y1 = linearSpring.pointA.position.y;
        //     let x2 = linearSpring.pointB.position.x;
        //     let y2 = linearSpring.pointB.position.y;

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
            let lineSegment = this.simulation.world.lineSegments[i];
            let x1 = lineSegment.pointA.position.x;
            let y1 = lineSegment.pointA.position.y;
            let x2 = lineSegment.pointB.position.x;
            let y2 = lineSegment.pointB.position.y;

            this.ctx.lineWidth = lineSegment.radius * 2;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Draw Points
        for (let i = 0; i < this.simulation.world.points.length; i++) {
            let point = this.simulation.world.points[i];
            let x = point.position.x;
            let y = point.position.y;

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
        //     let particle = this.simulation.world.particles[i];
        //     let x = particle.position.x;
        //     let y = particle.position.y;

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
        //     let wheel = this.simulation.world.wheels[i];
        //     let x = wheel.position.x;
        //     let y = wheel.position.y;
        //     let r = wheel.radius * 0.5;

        //     this.ctx.beginPath();
        //     this.ctx.arc(x, y, wheel.radius, 0, Math.PI * 2);
        //     //this.ctx.fillStyle = wheel.color;
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     let pos = wheel.position;

        //     // Light gray line in direction of angle
        //     let x2 = pos.x + wheel.angleVector.x * r;
        //     let y2 = pos.y + wheel.angleVector.y * r;
        //     let direction = new Vector2(x2 - x, y2 - y);

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(pos.x, pos.y);
        //     this.ctx.lineTo(x2, y2);
        //     this.ctx.strokeStyle = "rgb(192, 192, 192)";
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     // Green line in direction of right perpendicular of angle
        //     let right = pos.add(wheel.angleVector.perp().mul(r));

        //     this.ctx.beginPath();
        //     this.ctx.moveTo(pos.x, pos.y);
        //     this.ctx.lineTo(right.x, right.y);
        //     this.ctx.strokeStyle = "rgb(32, 255, 32)";
        //     this.ctx.stroke();
        //     this.ctx.closePath();

        //     // Red line in direction of left perpendicular of angle
        //     let right = pos.add(wheel.angleVector.perp().mul(-r));

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
            let linearState = this.simulation.world.linearStates[i];
            let x = linearState.position.x;
            let y = linearState.position.y;

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

        // for (let i = 0; i < this.simulation.world.angularStates.length; i++) {
        //     let angularState = this.simulation.world.angularStates[i];

            //this.renderAngularState(angularState, 24);

            // let pos = angularState.position;

            // // Light gray line in direction of angle
            // let x2 = pos.x + angularState.angleVector.x * 16;
            // let y2 = pos.y + angularState.angleVector.y * 16;
            // let direction = new Vector2(x2 - x, y2 - y);

            // this.ctx.beginPath();
            // this.ctx.moveTo(pos.x, pos.y);
            // this.ctx.lineTo(x2, y2);
            // this.ctx.strokeStyle = "rgb(192, 192, 192)";
            // this.ctx.stroke();
            // this.ctx.closePath();

            // // Green line in direction of right perpendicular of angle
            // let right = pos.add(angularState.angleVector.perp().mul(16));

            // this.ctx.beginPath();
            // this.ctx.moveTo(pos.x, pos.y);
            // this.ctx.lineTo(right.x, right.y);
            // this.ctx.strokeStyle = "rgb(32, 255, 32)";
            // this.ctx.stroke();
            // this.ctx.closePath();

            // // Red line in direction of left perpendicular of angle
            // let right = pos.add(angularState.angleVector.perp().mul(-16));

            // this.ctx.beginPath();
            // this.ctx.moveTo(pos.x, pos.y);
            // this.ctx.lineTo(right.x, right.y);
            // this.ctx.strokeStyle = "rgb(255, 32, 32)";
            // this.ctx.stroke();
            // this.ctx.closePath();

            // // Dot in center
            // this.ctx.beginPath();
            // this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            // this.ctx.fillStyle = "rgb(128, 128, 128)";
            // this.ctx.fill();
            // this.ctx.closePath();

        //}

        // Draw lineSegmentParticleCollisions for debugging

        // for (let i = 0; i < this.simulation.world.collisions.size; i++) {
        //     const keys = Array.from(this.simulation.world.collisions.keys());
        //     // Get collision
        //     if (this.simulation.world.collisions.get(keys[i]) instanceof LineSegmentParticleCollision) {
                    
        //         let collision = this.simulation.world.collisions.get(keys[i]);

        //         // Draw collision points
        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 255, 255)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.particleCollisionPoint.x, collision.particleCollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 255, 255)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         // Draw line between collision points
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y);
        //         this.ctx.lineTo(collision.particleCollisionPoint.x, collision.particleCollisionPoint.y);
        //         this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         this.ctx.stroke();
        //         this.ctx.closePath();
                
        //         // let deltaPosition = collision.particleCollisionPoint.sub(collision.lineSegmentCollisionPoint);
        //         // let deltaVelocity = particle3.velocity;
        //         // let positionError = collision.normal.dot(deltaPosition);
        //         // let velocityError = collision.normal.dot(deltaVelocity);
        //         // let restImpulse = -(positionError * 1.0 * 60 + velocityError * 1.0);
        //         // particle3.addImpulse(collision.normal.mul(restImpulse));
        //         //console.log({deltaPosition : deltaPosition, deltaVelocity : deltaVelocity, positionError : positionError, velocityError : velocityError, restImpulse : restImpulse});
        //     }
        // }

        // Draw ParticleParticleCollisions for debugging
        // for (let i = 0; i < this.simulation.world.collisions.size; i++) {
        //     const keys = Array.from(this.simulation.world.collisions.keys());
        //     // Get collision
        //     if (this.simulation.world.collisions.get(keys[i]) instanceof ParticleParticleCollision) {

        //         let collision = this.simulation.world.collisions.get(keys[i]);

        //         // Draw collision points
        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 255, 255)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.particleBCollisionPoint.x, collision.particleBCollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 255, 255)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.moveTo(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y);
        //         this.ctx.lineTo(collision.particleACollisionPoint.x - collision.normal.x * collision.distance, collision.particleACollisionPoint.y - collision.normal.y * collision.distance);
        //         this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         this.ctx.stroke();
        //         this.ctx.closePath();
                
        //         // Draw line between collision points
        //         // this.ctx.beginPath();
        //         // this.ctx.moveTo(collision.particleACollisionPoint.x, collision.particleACollisionPoint.y);
        //         // this.ctx.lineTo(collision.particleBCollisionPoint.x, collision.particleBCollisionPoint.y);
        //         // this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         // this.ctx.stroke();
        //         // this.ctx.closePath();
        //     }
        // }

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
        // for (let i = 0; i < this.simulation.world.collisions.size; i++) {
        //     const keys = Array.from(this.simulation.world.collisions.keys());
        //     //console.log(this.simulation.world.collisions.get(keys[i]))
        //     if (this.simulation.world.collisions.get(keys[i]) instanceof LineSegmentWheelCollision) {

        //         let collision = this.simulation.world.collisions.get(keys[i]);

        //         // Draw collision points
        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.lineSegmentCollisionPoint.x, collision.lineSegmentCollisionPoint.y, 4, 0, Math.PI * 2);
        //         this.ctx.fillStyle = "rgb(255, 0, 0)";
        //         this.ctx.fill();
        //         this.ctx.closePath();

        //         this.ctx.beginPath();
        //         this.ctx.arc(collision.wheelCollisionPoint.x, collision.wheelCollisionPoint.y, 4, 0, Math.PI * 2);
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
        //         this.ctx.lineTo(collision.wheelCollisionPoint.x, collision.wheelCollisionPoint.y);
        //         this.ctx.strokeStyle = "rgb(255, 255, 255)";
        //         this.ctx.stroke();
        //         this.ctx.closePath();
        //     }
        // }

        this.ctx.restore(); // Restore the context state

        // Render info in top-left corner of screen
        this.ctx.font = "24px Arial";
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

        let x = angularState.position.x;
        let y = angularState.position.y;

        // Wheel circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, angularState.radius - 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = angularState.color;
        this.ctx.stroke();
        this.ctx.closePath();

        let pos = angularState.position;

        // Light gray line in direction of angle
        let x2 = pos.x + angularState.angleVector.x * radius;
        let y2 = pos.y + angularState.angleVector.y * radius;

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = "rgb(192, 192, 192)";
        this.ctx.stroke();
        this.ctx.closePath();

        // Green line in direction of right perpendicular of angle
        let right = pos.add(angularState.angleVector.perp().mul(radius));

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(right.x, right.y);
        this.ctx.strokeStyle = "rgb(32, 255, 32)";
        this.ctx.stroke();
        this.ctx.closePath();

        // Red line in direction of left perpendicular of angle
        let left = pos.add(angularState.angleVector.perp().mul(-radius));

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