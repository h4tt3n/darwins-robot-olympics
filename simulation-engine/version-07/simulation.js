"use strict";


import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { ToolBox } from '../../toolbox/version-01/toolbox.js';
import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Network, ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, Individual } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from './renderer.js';
import { Ray, RayCamera } from './rayCaster.js';
import { WayPoint } from './wayPoint.js';
import { Robot } from './robot.js';
import { FitnessEvaluator } from './fitnessEvaluator.js';
import { constants } from '../../physics-engine/version-01/constants.js';

class Simulation {
    constructor(params = {}) {
        this.params = params;

        this.world = new SquishyPlanet.World();
        this.renderer = new Renderer('canvas', this);
        this.geneticAlgorithm = new GeneticAlgorithm(params.gaParams);
        this.fitnessEvaluator = new FitnessEvaluator();

        // Render, UI and mouse / keyboard control
        this.renderRaycasts = false;
        this.followSelectedCreature = false;
        this.selectedCreature = null;

        // Basic business logic
        this.isInitiated = false;
        this.isPaused = false;
        this.generation = 0;
        this.generationTicks = 0;
        this.generationMaxTicks = 1000;
        this.setIntervalId = null;

        this.robotSpawner = {
            func : null,
            params : null,
        };

        this.challengeSpawner = {
            func : null,
            params : null,
        };

        this.rays = [];
        this.rayCameras = [];
        this.neuralNetworks = [];
        this.wayPoints = [];

        //
        this.individuals = [];
        this.deadIndividuals = [];

        this.robots = [];
        this.deadRobots = [];
    }
    reset() {
        
        // Reset physics
        this.world.reset();

        // Reset simulation
        this.renderRaycasts = false;
        this.followSelectedCreature = false;
        this.selectedCreature = null;

        // Basic business logic
        this.isInitiated = false;
        this.isPaused = false;
        this.generation = 0;
        this.generationTicks = 0;
        this.generationMaxTicks = 1000;
        this.setIntervalId = null;

        this.rays = [];
        this.rayCameras = [];
        this.neuralNetworks = [];
        this.wayPoints = [];

        this.individuals = [];
        this.deadIndividuals = [];

        this.robots = [];
        this.deadRobots = [];
    }
    update() {
        if (this.isPaused) { return; }

        this.generationTicks++;

        // Physics (Robot body)
        this.world.update();

        // Raycasting (Robot vision)
        let raycastableSegments = this.world.lineSegments; //.concat(this.world.linearSprings);
        this.rayCameras.forEach(rayCamera => { rayCamera.castAll(raycastableSegments) });
        this.rayCameras.forEach(rayCamera => { rayCamera.update() });

        // Neural network (Robot brain)
        this.robots.forEach(robot => { robot.update(); });

        // Evaluate population
        this.evaluate();
    }
    evaluate() {
    
        // Check if robot has completed challenge, using challenge-specific functions
        for (let i = 0; i < this.robots.length; i++) {
            
            let robot = this.robots[i];
            
            if (this.creatureTimeouts(robot, this.generationMaxTicks) || this.hasReachedTarget(robot, this.wayPoints[0])) {
                this.calculateFitness(robot, this.wayPoints[0]);
                console.log("fitness " + robot.fitness);
                this.deleteRobot(robot);
            } else {
                robot.ticksAlive++;
            }
        }
    
        // When all robots are disabled, create new generation
        if (this.robots.length === 0) {

            console.log("\n");
            console.log("generation " + this.generation + " completed!");
            console.log("\n");
            
            // Run genetic algorithm
            this.runGeneticAlgorithm();
            
            // Create new robots
            //this.robotSpawner.func(this.robotSpawner.numRobots, this.robotSpawner.robotParams, this.individuals);
            this.robotSpawner.func(this.robotSpawner.numRobots, this.robotSpawner.robotParams, this.individuals);
            
            // Reset simulation
            this.deadRobots = [];
            //this.world.collisions = new Map();
            this.generationTicks = 0;
            this.generation++;
        }
    }
    distanceToTarget(creature, target) {
        let position = creature.body.particles[0].position;
        let distance = position.distance(target.position);
        return distance;
    }
    hasReachedTarget(creature, target) {
        let distance = this.distanceToTarget(creature, target);
        if (distance < target.radius + creature.body.particles[0].radius) {
            return true;
        } else {
            return false;
        }
    }
    calculateFitness(creature, target) {
        let fitness = 0;
        fitness += this.distanceToTarget(creature, target);
        fitness += creature.ticksAlive;
        if (this.hasReachedTarget(creature, target)) {
            fitness *= 0.5;
        }
        creature.fitness = fitness;
    }
    creatureTimeouts(creature, timeout) {
        return (creature.ticksAlive > timeout);
    }
    runGeneticAlgorithm() {
        // Clear old individuals
        this.deadIndividuals = [];

        // Create genetic algorithm individuals from disabled robots
        for (let i = 0; i < this.deadRobots.length; i++) {
            let individualParams = {
                genome : this.deadRobots[i].brain.encode(),
                fitness : this.deadRobots[i].fitness,
            }
            this.createIndividual(individualParams);
        }

        // Run genetic algorithm
        this.individuals = this.geneticAlgorithm.step(this.deadIndividuals);
    }
    createWaypoint(position, radius, color) {
        let wayPoint = new WayPoint(position, radius, color);
        this.wayPoints.push(wayPoint);
        return wayPoint;
    }
    deleteWaypoint(wayPoint) {
        this.wayPoints.splice(this.wayPoints.indexOf(wayPoint), 1);
    }

    // Robot creation functions

    //
    deleteRobot(robot) {
        // Delete collisions
        const collisionKeys = Array.from(this.world.collisions.keys());
        for (let i = 0; i < collisionKeys.length; i++) {
            const collisionKey = collisionKeys[i];
            const collision = this.world.collisions.get(collisionKey);
            const objectIds = this.world.collisionHandler.getObjectIdsFromCollisionObjectId(collision.objectId);
            if (robot.body.wheels != undefined) {
                for (let i = 0; i < robot.body.wheels.length; i++) {         
                    if (objectIds.includes(robot.body.wheels[i].objectId)) {
                        this.world.collisions.delete(collisionKey);
                    }
                }
            }
            if (robot.body.particles != undefined) {
                for (let i = 0; i < robot.body.particles.length; i++) {
                    if (objectIds.includes(robot.body.particles[i].objectId)) {
                        this.world.collisions.delete(collisionKey);
                    }
                }
            }
        }
        // Delete brain
        this.deleteNeuralNetwork(robot.brain);
        // Delete senses
        this.deleteRayCamera(robot.eyes);
        // Delete body
        if (robot.body.angularSprings != undefined) {
            for (let i = 0; i < robot.body.angularSprings.length; i++) {
                this.world.deleteAngularSpring(robot.body.angularSprings[i]);
            }
        }
        if (robot.body.linearSprings != undefined) {
            for (let i = 0; i < robot.body.linearSprings.length; i++) {
                this.world.deleteLinearSpring(robot.body.linearSprings[i]);
            }
        }
        if (robot.body.fixedSprings != undefined) {
            for (let i = 0; i < robot.body.fixedSprings.length; i++) {
                this.world.deleteFixedSpring(robot.body.fixedSprings[i]);
            }
        }
        if (robot.body.gearConstraints != undefined) {
            for (let i = 0; i < robot.body.gearConstraints.length; i++) {
                this.world.deleteGearConstraint(robot.body.gearConstraints[i]);
            }
        }
        if (robot.body.wheels != undefined) {
            for (let i = 0; i < robot.body.wheels.length; i++) {
                this.world.deleteWheel(robot.body.wheels[i]);
            }
        }
        if (robot.body.particles != undefined) {
            for (let i = 0; i < robot.body.particles.length; i++) {
                this.world.deleteParticle(robot.body.particles[i]);
            }
        }
        // Delete robot
        this.robots.splice(this.robots.indexOf(robot), 1);
        this.deadRobots.push(robot);
    }

    //
    createRobot(params = {}) {

    }   

    //
    //createTopDownTracker(params = {}) {
    createTopDownTracker(brainGenome) {
        
        const robotParams = {
            name : "topDownTracker",
            brain : {
                // Number of input nodes must match sum of sensory inputs
                layers : [11, 24, 2],
                activation : {
                    func : ActivationFunctions.parametricTanhLike,
                },
            },
            sensors : {
                vision : {
                    position : new Vector2(0, 0),
                    direction : Math.PI * 2 * 0,
                    // Number of rays must match number of brain input nodes
                    numRays : 11,
                    fieldOfView : Math.PI * 2 * 0.5,
                },
            },
            body : {
                position : new Vector2(0, 0),
                velocity : Vector2.zero,
                // color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                particles : [
                    {
                        name : "particle",
                        args :  {
                            position : new Vector2(0, 0),
                            mass : 10,
                            radius : 20,
                            color: "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                        },
                    },
                ],
                wheels : [
                    {
                        name : "wheel",
                        args : {
                            position : new Vector2(0, 0),
                            mass : 10,
                            angle : 0,
                            inertia : null,
                            radius : 40,
                        },
                    },
                ],
                fixedSprings : [
                    {
                        name : "fixedSpring",
                        args : {
                            linearStateA : "wheel",
                            linearStateB : "particle",
                            stiffness : 0.5,
                            damping : 0.5,
                            warmStart : 0.5,
                        },
                    },
                ],
            },
            updateFunc : function update() {

                let wheel = body.get("wheel");
                //let wheel = this.body.wheels.get("wheel");

                // Update camera position and angle
                this.eyes.origin = wheel.position;
                this.eyes.directionVector = wheel.angleVector;
                // this.eyes.origin = this.body.wheels[0].position;
                // this.eyes.directionVector = this.body.wheels[0].angleVector;
        
                // Update camera
                let intersections = this.eyes.getOutput();
        
                // Input camera data to neural network
                let inputs = [];
                
                for (let i = 0; i < intersections.length; i++) {
                    inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
                    
                    //let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                    //invDistance = ToolBox.map(invDistance, 0, 1, -1, 1);
                    //invDistance = (invDistance * 2) - 1;
                    //inputs.push(intersections[i] ? invDistance : 0.0);
                }
        
                this.brain.setInput(inputs);
        
                // Run neural network
                this.brain.run();
        
                // Get output from neural network
                let output = this.brain.getOutput();
        
                // Rotation
                let deltaAngle = 0.0;
                if (output[0] > 0.5) {
                    deltaAngle = 0.02;
                } else if (output[0] < -0.5) {
                    deltaAngle = -0.02;
                } else {
                    deltaAngle = 0.0;
                }
                // use "wheel" from bodyMap
                wheel.angularImpulse = 0.0;
                wheel.angularVelocity = 0.0;
                wheel.angle += deltaAngle;
                wheel.computeAngleVector();

                // this.body.wheels[0].angularImpulse = 0.0;
                // this.body.wheels[0].angularVelocity = 0.0;
                // this.body.wheels[0].angle += deltaAngle;
                // this.body.wheels[0].computeAngleVector();

                // Movement in forward direction (kinematic)
                wheel.velocity = Vector2.zero;
                wheel.impulse = constants.GRAVITY.mul(new Vector2(0, -1));
                wheel.addPosition(wheel.angleVector.mul(ToolBox.map(output[1], -1, 1, 0.0, 5.0)));
                // this.body.wheels[0].velocity = Vector2.zero;
                // this.body.wheels[0].impulse = constants.GRAVITY.mul(new Vector2(0, -1));
                // this.body.wheels[0].addPosition(this.body.wheels[0].angleVector.mul(ToolBox.map(output[1], -1, 1, 0.0, 5.0)));
            },
        }

        let roboParamsJson = JSON.stringify(robotParams);
        console.log(roboParamsJson);

        // Body
        const body = new Map();

        if (robotParams.body.particles != undefined) {
            for( let i = 0; i < robotParams.body.particles.length; i++) {
                let particle = this.world.createParticle(
                    robotParams.body.particles[i].args.position, 
                    robotParams.body.particles[i].args.mass, 
                    robotParams.body.particles[i].args.radius,
                    robotParams.body.particles[i].args.color
                );
                //body.particles.push(particle);
                body.set(robotParams.body.particles[i].name, particle);
            }
        }

        if (robotParams.body.wheels != undefined) {
            for( let i = 0; i < robotParams.body.wheels.length; i++) {
                let wheel = this.world.createWheel(
                    robotParams.body.wheels[i].args.position, 
                    robotParams.body.wheels[i].args.mass, 
                    robotParams.body.wheels[i].args.angle, 
                    robotParams.body.wheels[i].args.inertia, 
                    robotParams.body.wheels[i].args.radius
                );
                //body.wheels.push(wheel);
                body.set(robotParams.body.wheels[i].name, wheel);
            }
        }

        if (robotParams.body.fixedSprings != undefined) {
            for( let i = 0; i < robotParams.body.fixedSprings.length; i++) {
                //console.log(robotParams.body);
                let fixedSpring = this.world.createFixedSpring(
                    body.get(robotParams.body.fixedSprings[i].args.linearStateA),
                    body.get(robotParams.body.fixedSprings[i].args.linearStateB),
                    robotParams.body.fixedSprings[i].args.stiffness, 
                    robotParams.body.fixedSprings[i].args.damping, 
                    robotParams.body.fixedSprings[i].args.warmStart
                );
                //body.fixedSprings.push(fixedSpring);
                body.set(robotParams.body.fixedSprings[i].name, fixedSpring);
            }
        }

        // let wheel = this.world.createWheel(robotParams.body.position.add(new Vector2(0, -100)), 10, 0, null, 40);
        // wheel.color = robotParams.body.color;
        // body.wheels.push(wheel);

        // let btmLeftParticle = this.world.createParticle(robotParams.body.position.add(new Vector2(0, -100)), 1, 10, robotParams.body.color);
        // body.particles.push(btmLeftParticle);

        // let wheelParticleFixedSpring = this.world.createFixedSpring(wheel, btmLeftParticle, 0.5, 0.5, 0.5);
        // wheelParticleFixedSpring.radius = 6;
        // body.fixedSprings.push(wheelParticleFixedSpring);

        // Create brain
        //const brain = this.createNeuralNetwork(params.brain.genome, robotParams.brain);
        const brain = this.createNeuralNetwork(brainGenome, robotParams.brain);
        
        // Create vision
        const vision = this.createRayCamera(
            robotParams.sensors.vision.position, 
            robotParams.sensors.vision.direction, 
            robotParams.sensors.vision.numRays, 
            robotParams.sensors.vision.fieldOfView
        );

        // Create robot
        let tracker = new Robot(brain, body, vision, robotParams.updateFunc);
        this.robots.push(tracker);
        return tracker;
    }


    //
    //createRoboCar(params = {}) {
    createRoboCar(brainGenome) {

        let body = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            gearConstraints : [],
            wheels : [],
        }

        let position = new Vector2(0, 200); //new Vector2(0, 0);
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Wheels
        let wheelRadius = 40;
        let wheelMass = 10;
        let engine = this.world.createWheel(position.add(new Vector2(0, -100)), wheelMass * 2, 0, null, wheelRadius);
        let wheel1 = this.world.createWheel(position.add(new Vector2(-100, 0)), wheelMass, 0, null, wheelRadius);
        let wheel2 = this.world.createWheel(position.add(new Vector2(100, 0)), wheelMass, 0, null, wheelRadius);
        engine.color = randomColor;
        wheel1.color = randomColor;
        wheel2.color = randomColor;
        body.wheels.push(engine);
        body.wheels.push(wheel1);
        body.wheels.push(wheel2);

        // GearConstraint between engine and wheel
        let engineToWheel1 = this.world.createGearConstraint(engine, wheel1, 1.0);
        let engineToWheel2 = this.world.createGearConstraint(engine, wheel2, 1.0);
        let wheel1ToWheel2 = this.world.createGearConstraint(wheel1, wheel2, 1.0);
        body.gearConstraints.push(engineToWheel1);
        body.gearConstraints.push(engineToWheel2);
        body.gearConstraints.push(wheel1ToWheel2);

        // Body
        let btmLeftParticle = this.world.createParticle(position.add(new Vector2(-50, -50)), 10, 10, randomColor);
        let btmRightParticle = this.world.createParticle(position.add(new Vector2(50, -50)), 10, 10, randomColor);
        let topRightParticle = this.world.createParticle(position.add(new Vector2(50, -150)), 10, 10, randomColor);
        let topLeftParticle = this.world.createParticle(position.add(new Vector2(-50, -150)), 10, 10, randomColor);

        body.particles.push(btmLeftParticle);
        body.particles.push(btmRightParticle);
        body.particles.push(topRightParticle);
        body.particles.push(topLeftParticle);

        let btmLeftToBtmRight = this.world.createLinearSpring(btmLeftParticle, btmRightParticle, 0.5, 0.5, 0.5);
        let btmRightToTopRight = this.world.createLinearSpring(btmRightParticle, topRightParticle, 0.5, 0.5, 0.5);
        let topRightToTopLeft = this.world.createLinearSpring(topRightParticle, topLeftParticle, 0.5, 0.5, 0.5);
        let topLeftToBtmLeft = this.world.createLinearSpring(topLeftParticle, btmLeftParticle, 0.5, 0.5, 0.5);
        btmLeftToBtmRight.radius = 8;
        btmLeftToBtmRight.color = randomColor2;
        btmRightToTopRight.radius = 8;
        btmRightToTopRight.color = randomColor2;
        topRightToTopLeft.radius = 8;
        topRightToTopLeft.color = randomColor2;
        topLeftToBtmLeft.radius = 8;
        topLeftToBtmLeft.color = randomColor2;


        body.linearSprings.push(btmLeftToBtmRight);
        body.linearSprings.push(btmRightToTopRight);
        body.linearSprings.push(topRightToTopLeft);
        body.linearSprings.push(topLeftToBtmLeft);

        // AngularSprings between body parts
        // let btmLeftToBtmRightAngular = this.world.createAngularSpring(btmLeftToBtmRight, btmRightToTopRight, 0.125, 1.0, 0.5);
        // let btmRightToTopRightAngular = this.world.createAngularSpring(btmRightToTopRight, topRightToTopLeft, 0.125, 1.0, 0.5);
        // let topRightToTopLeftAngular = this.world.createAngularSpring(topRightToTopLeft, topLeftToBtmLeft, 0.125, 1.0, 0.5);
        // let topLeftToBtmLeftAngular = this.world.createAngularSpring(topLeftToBtmLeft, btmLeftToBtmRight, 0.125, 1.0, 0.5);

        // body.angularSprings.push(btmLeftToBtmRightAngular);
        // body.angularSprings.push(btmRightToTopRightAngular);
        // body.angularSprings.push(topRightToTopLeftAngular);
        // body.angularSprings.push(topLeftToBtmLeftAngular);

        let btmLeftToEngine = this.world.createLinearSpring(btmLeftParticle, engine, 0.5, 0.5, 0.5);
        let btmRightToEngine = this.world.createLinearSpring(btmRightParticle, engine, 0.5, 0.5, 0.5);
        let topLeftToEngine = this.world.createLinearSpring(topLeftParticle, engine, 0.5, 0.5, 0.5);
        let topRightToEngine = this.world.createLinearSpring(topRightParticle, engine, 0.5, 0.5, 0.5);
        btmLeftToEngine.radius = 8;
        btmLeftToEngine.color = randomColor2;
        btmRightToEngine.radius = 8;
        btmRightToEngine.color = randomColor2;
        topLeftToEngine.radius = 8;
        topLeftToEngine.color = randomColor2;
        topRightToEngine.radius = 8;
        topRightToEngine.color = randomColor2;

        body.linearSprings.push(btmLeftToEngine);
        body.linearSprings.push(btmRightToEngine);
        body.linearSprings.push(topLeftToEngine);
        body.linearSprings.push(topRightToEngine);

        // Wheel
        let btmLeftToWheel1 = this.world.createLinearSpring(btmLeftParticle, wheel1, 0.125, 0.5, 0.5);
        let btmRightToWheel2 = this.world.createLinearSpring(btmRightParticle, wheel2, 0.125, 0.5, 0.5);
        btmLeftToWheel1.radius = 8;
        btmLeftToWheel1.color = randomColor2;
        btmRightToWheel2.radius = 8;
        btmRightToWheel2.color = randomColor2;

        body.linearSprings.push(btmLeftToWheel1);
        body.linearSprings.push(btmRightToWheel2);

        let btmLeftToWheel1Angular = this.world.createAngularSpring(btmLeftToBtmRight, btmLeftToWheel1, 0.125, 0.5, 0.5);
        let btmRightToWheel2Angular = this.world.createAngularSpring(btmLeftToBtmRight, btmRightToWheel2, 0.125, 0.5, 0.5);

        body.angularSprings.push(btmLeftToWheel1Angular);
        body.angularSprings.push(btmRightToWheel2Angular);

        // Create vision
        let numRays = 12;

        let visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        let brainParams = {
            //layers : [7, 24, 8],
            layers : [numRays, 16, 4],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
                //func : ActivationFunctions.invParametricTanhLike,
                //func : ActivationFunctions.tanhLike2,
            },
        }

        //let brain = this.createNeuralNetwork(params.brain.genome, brainParams);
        let brain = this.createNeuralNetwork(brainGenome, brainParams);

        // Update function
        let update = function update() {
        
            // Update camera position and angle
            const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
            this.eyes.directionVector = angleVector.perp();
            this.eyes.origin = this.body.wheels[0].position;
    
            // Update camera
            //this.eyes.castAll(this.world.lineSegments);
            //this.eyes.update();
            let intersections = this.eyes.getOutput();
    
            // Input camera data to neural network
            let inputs = [];
            
            for (let i = 0; i < intersections.length; i++) {
                //inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
                
                let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                inputs.push(intersections[i] ? invDistance : 0.0);

                // if (i === 0) {
                //     console.log(inputs);
                // }
            }

            //console.log({inputs : inputs, intersections : intersections});

            this.brain.setInput(inputs);
    
            // Run neural network
            this.brain.run();
    
            // Get output from neural network
            let output = this.brain.getOutput();

            //console.log(output);
    
            // Acceleration
            this.body.wheels[0].addAngularImpulse(output[0] * 0.2);
    
            // Brake
            // TODO: Model as constraint, and make gradual, not binary
            if(output[1] > 0.0){
                this.body.wheels[0].angularImpulse = 0.0;
                this.body.wheels[0].angularVelocity = 0.0;
            }
    
            // Gearing
            let gearing = 1.0;
    
            if      (output[2] >= -1.00 && output[2] < -0.33) { gearing = 0.25; } 
            else if (output[2] >= -0.33 && output[2] <  0.33) { gearing = 1.0; } 
            else if (output[2] >=  0.33 && output[2] <= 1.00) { gearing = 4.0; }
    
            this.body.gearConstraints[0].setGearRatio(gearing);
            this.body.gearConstraints[1].setGearRatio(gearing);
    
            // Set steering constraint min/max angles
            let minAngleLeft = Math.PI * 2 * (0.375 - 0.125);
            let maxAngleLeft = Math.PI * 2 * (0.375 + 0.125);
            let minAngleRight = Math.PI * 2 * (0.125 - 0.125);
            let maxAngleRight = Math.PI * 2 * (0.125 + 0.125);
    
            // Set rest angles of steering constraints
            this.body.angularSprings[0].setRestAngleVector( ToolBox.map(output[3], -1, 1, minAngleLeft, maxAngleLeft));
            this.body.angularSprings[1].setRestAngleVector( ToolBox.map(output[3], -1, 1, maxAngleRight, minAngleRight));
        }

        // Create robot
        let car = new Robot(brain, body, eyes, update);
        this.robots.push(car);
        return car;
    }

    //
    //createRoboGuy(params = {}) {
    createRoboGuy(brainGenome) {
        
        let bodyParts = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            leftUpperArmAngular : null,
            rightUpperArmAngular : null,
            leftLowerArmAngular : null,
            rightLowerArmAngular : null,
            leftUpperLegAngular : null,
            rightUpperLegAngular : null,
            leftLowerLegAngular : null,
            rightLowerLegAngular : null,

        }

        let position = new Vector2(200, 0); //new Vector2(0, 0);
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Head
        var head = this.world.createParticle(position, 20, 25, randomColor);
        bodyParts.particles.push(head);

        // Upper torso
        var upperTorso = this.world.createParticle(position.add(new Vector2(0, 50)), 20, 30, randomColor);
        bodyParts.particles.push(upperTorso);

        // Center torso
        var centerTorso = this.world.createParticle(position.add(new Vector2(0, 100)), 20, 20, randomColor);
        bodyParts.particles.push(centerTorso);

        // Lower torso
        var lowerTorso = this.world.createParticle(position.add(new Vector2(0, 150)), 20, 25, randomColor);
        bodyParts.particles.push(lowerTorso);

        // Neck linear
        var neckLinear = this.world.createLinearSpring(head, upperTorso, 1.0, 1.0, 1.0);
        neckLinear.radius = 10;
        neckLinear.color = randomColor2;
        bodyParts.linearSprings.push(neckLinear);

        // Upper torso linear
        var upperTorsoLinear = this.world.createLinearSpring(upperTorso, centerTorso, 1.0, 1.0, 1.0);
        upperTorsoLinear.radius = 10;
        upperTorsoLinear.color = randomColor2;
        bodyParts.linearSprings.push(upperTorsoLinear);

        // Lower torso linear
        var lowerTorsoLinear = this.world.createLinearSpring(centerTorso, lowerTorso, 1.0, 1.0, 1.0);
        lowerTorsoLinear.radius = 10;
        lowerTorsoLinear.color = randomColor2;
        bodyParts.linearSprings.push(lowerTorsoLinear);

        // Neck angular
        var neckAngular = this.world.createAngularSpring(neckLinear, upperTorsoLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(neckAngular);

        // Torso angular
        var torsoAngular = this.world.createAngularSpring(upperTorsoLinear, lowerTorsoLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(torsoAngular);

        // Left elbow
        var leftElbow = this.world.createParticle(position.add(new Vector2(-60, 50)), 10, 10, randomColor);
        bodyParts.particles.push(leftElbow);

        // Left hand
        var leftHand = this.world.createParticle(position.add(new Vector2(-120, 50)), 15, 15, randomColor);
        bodyParts.particles.push(leftHand);

        // Left upper arm linear
        var leftUpperArmLinear = this.world.createLinearSpring(upperTorso, leftElbow, 1.0, 1.0, 1.0);
        leftUpperArmLinear.radius = 10;
        leftUpperArmLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftUpperArmLinear);

        // Left lower arm linear
        var leftLowerArmLinear = this.world.createLinearSpring(leftElbow, leftHand, 1.0, 1.0, 1.0);
        leftLowerArmLinear.radius = 10;
        leftLowerArmLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftLowerArmLinear);

        // Left upper arm angular
        var leftUpperArmAngular = this.world.createAngularSpring(upperTorsoLinear, leftUpperArmLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftUpperArmAngular);
        bodyParts.leftUpperArmAngular = leftUpperArmAngular;

        // Left lower arm angular
        var leftLowerArmAngular = this.world.createAngularSpring(leftUpperArmLinear, leftLowerArmLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftLowerArmAngular);
        bodyParts.leftLowerArmAngular = leftLowerArmAngular;

        // Right elbow
        var rightElbow = this.world.createParticle(position.add(new Vector2(60, 50)), 10, 10, randomColor);
        bodyParts.particles.push(rightElbow);

        // Right hand
        var rightHand = this.world.createParticle(position.add(new Vector2(120, 50)), 15, 15, randomColor);
        bodyParts.particles.push(rightHand);

        // Right upper arm linear
        var rightUpperArmLinear = this.world.createLinearSpring(upperTorso, rightElbow, 1.0, 1.0, 1.0);
        rightUpperArmLinear.radius = 10;
        rightUpperArmLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightUpperArmLinear);

        // Right lower arm linear
        var rightLowerArmLinear = this.world.createLinearSpring(rightElbow, rightHand, 1.0, 1.0, 1.0);
        rightLowerArmLinear.radius = 10;
        rightLowerArmLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightLowerArmLinear);

        // Right upper arm angular
        var rightUpperArmAngular = this.world.createAngularSpring(upperTorsoLinear, rightUpperArmLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightUpperArmAngular);
        bodyParts.rightUpperArmAngular = rightUpperArmAngular;

        // Right lower arm angular
        var rightLowerArmAngular = this.world.createAngularSpring(rightUpperArmLinear, rightLowerArmLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightLowerArmAngular);
        bodyParts.rightLowerArmAngular = rightLowerArmAngular;

        // Left knee
        var leftKnee = this.world.createParticle(position.add(new Vector2(0, 200)), 10, 10, randomColor);
        bodyParts.particles.push(leftKnee);

        // Left ankle
        var leftAnkle = this.world.createParticle(position.add(new Vector2(0, 250)), 15, 15, randomColor);
        bodyParts.particles.push(leftAnkle);

        // Left heel
        var leftHeel = this.world.createParticle(position.add(new Vector2(-25, 260)), 15, 15, randomColor);
        bodyParts.particles.push(leftHeel);

        // Left sole
        var leftSole = this.world.createParticle(position.add(new Vector2(50, 260)), 15, 15, randomColor);
        bodyParts.particles.push(leftSole);

        // Left upper leg linear
        var leftUpperLegLinear = this.world.createLinearSpring(lowerTorso, leftKnee, 1.0, 1.0, 1.0);
        leftUpperLegLinear.radius = 10;
        leftUpperLegLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftUpperLegLinear);

        // Left lower leg linear
        var leftLowerLegLinear = this.world.createLinearSpring(leftKnee, leftAnkle, 1.0, 1.0, 1.0);
        leftLowerLegLinear.radius = 10;
        leftLowerLegLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftLowerLegLinear);

        // Left heel linear
        var leftHeelLinear = this.world.createLinearSpring(leftAnkle, leftHeel, 1.0, 1.0, 1.0);
        leftHeelLinear.radius = 10;
        leftHeelLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftHeelLinear);

        // Left sole linear
        var leftSoleLinear = this.world.createLinearSpring(leftAnkle, leftSole, 1.0, 1.0, 1.0);
        leftSoleLinear.radius = 10;
        leftSoleLinear.color = randomColor2;
        bodyParts.linearSprings.push(leftSoleLinear);

        // Left upper leg angular
        var leftUpperLegAngular = this.world.createAngularSpring(lowerTorsoLinear, leftUpperLegLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftUpperLegAngular);
        bodyParts.leftUpperLegAngular = leftUpperLegAngular;

        // Left lower leg angular
        var leftLowerLegAngular = this.world.createAngularSpring(leftUpperLegLinear, leftLowerLegLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftLowerLegAngular);
        bodyParts.leftLowerLegAngular = leftLowerLegAngular;

        // Left heel angular
        var leftHeelAngular = this.world.createAngularSpring(leftLowerLegLinear, leftHeelLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftHeelAngular);

        // Left sole angular
        var leftSoleAngular = this.world.createAngularSpring(leftHeelLinear, leftSoleLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(leftSoleAngular);

        // Right knee
        var rightKnee = this.world.createParticle(position.add(new Vector2(0, 200)), 10, 10, randomColor);
        bodyParts.particles.push(rightKnee);

        // Right ankle
        var rightAnkle = this.world.createParticle(position.add(new Vector2(0, 250)), 15, 15, randomColor);
        bodyParts.particles.push(rightAnkle);

        // Right heel
        var rightHeel = this.world.createParticle(position.add(new Vector2(25, 260)), 15, 15, randomColor);
        bodyParts.particles.push(rightHeel);

        // Right sole
        var rightSole = this.world.createParticle(position.add(new Vector2(-50, 260)), 15, 15, randomColor);
        bodyParts.particles.push(rightSole);

        // Right upper leg linear
        var rightUpperLegLinear = this.world.createLinearSpring(lowerTorso, rightKnee, 1.0, 1.0, 1.0);
        rightUpperLegLinear.radius = 10;
        rightUpperLegLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightUpperLegLinear);

        // Right lower leg linear
        var rightLowerLegLinear = this.world.createLinearSpring(rightKnee, rightAnkle, 1.0, 1.0, 1.0);
        rightLowerLegLinear.radius = 10;
        rightLowerLegLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightLowerLegLinear);

        // Right heel linear
        var rightHeelLinear = this.world.createLinearSpring(rightAnkle, rightHeel, 1.0, 1.0, 1.0);
        rightHeelLinear.radius = 10;
        rightHeelLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightHeelLinear);

        // Right sole linear
        var rightSoleLinear = this.world.createLinearSpring(rightAnkle, rightSole, 1.0, 1.0, 1.0);
        rightSoleLinear.radius = 10;
        rightSoleLinear.color = randomColor2;
        bodyParts.linearSprings.push(rightSoleLinear);

        // Right upper leg angular
        var rightUpperLegAngular = this.world.createAngularSpring(lowerTorsoLinear, rightUpperLegLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightUpperLegAngular);
        bodyParts.rightUpperLegAngular = rightUpperLegAngular;

        // Right lower leg angular
        var rightLowerLegAngular = this.world.createAngularSpring(rightUpperLegLinear, rightLowerLegLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightLowerLegAngular);
        bodyParts.rightLowerLegAngular = rightLowerLegAngular;

        // Right heel angular
        var rightHeelAngular = this.world.createAngularSpring(rightLowerLegLinear, rightHeelLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightHeelAngular);

        // Right sole angular
        var rightSoleAngular = this.world.createAngularSpring(rightHeelLinear, rightSoleLinear, 0.125, 1.0, 0.5);
        bodyParts.angularSprings.push(rightSoleAngular);

        // Create brain
        //let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        //let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        // Create vision
        let numRays = 12;

        let visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        let brainParams = {
            //layers : [7, 24, 8],
            layers : [numRays, 24, 8],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
                //func : ActivationFunctions.invParametricTanhLike,
                //func : ActivationFunctions.tanhLike2,
            },
        }

        //let brain = this.createNeuralNetwork(params.brain.genome, brainParams);
        let brain = this.createNeuralNetwork(brainGenome, brainParams);

        let update = function update() {

            // Update eyes
            
            // // //const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
            const angleVector = this.body.linearSprings[1].angleVector;
            this.eyes.directionVector = angleVector.perp();
            // // //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
            this.eyes.origin = this.body.particles[0].position;
    
            this.eyes.update();
    
            // Update brain
            let inputs = [];
    
            let intersections = this.eyes.getOutput();
            // // //console.log(intersections)
            
            for (let i = 0; i < intersections.length; i++) {
                inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
            }
    
            this.brain.setInput(inputs);
            this.brain.run();
            let output = this.brain.getOutput();
    
            let minShoulderAngle = Math.PI * 2 * 0.0;
            let maxShoulderAngle = -Math.PI * 2 * 0.5;
    
            let minElbowAngle = Math.PI * 2 * 0.0;
            let maxElbowAngle = Math.PI * 2 * 0.3;
    
            let hipAngle = Math.PI * 2 * 0.5;
            let kneeAngle = -Math.PI * 2 * 0.6;
            let jointAngle = Math.PI * 2 * 0.25;
            let legAngle = Math.PI * 2 * 0.25;
    
            // Update body
            this.body.leftUpperArmAngular.setRestAngleVector( ToolBox.map(output[0], -1, 1, minShoulderAngle, maxShoulderAngle));
            this.body.leftLowerArmAngular.setRestAngleVector( ToolBox.map(output[1], -1, 1, minElbowAngle, maxElbowAngle));
            this.body.rightUpperArmAngular.setRestAngleVector( ToolBox.map(output[2], -1, 1, minShoulderAngle, maxShoulderAngle));
            this.body.rightLowerArmAngular.setRestAngleVector( ToolBox.map(output[3], -1, 1, minElbowAngle, maxElbowAngle));
            this.body.leftUpperLegAngular.setRestAngleVector( ToolBox.map(output[4], -1, 1, 0, hipAngle));
            this.body.leftLowerLegAngular.setRestAngleVector( ToolBox.map(output[5], -1, 1, 0, kneeAngle));
            this.body.rightUpperLegAngular.setRestAngleVector( ToolBox.map(output[6], -1, 1, 0, hipAngle));
            this.body.rightLowerLegAngular.setRestAngleVector( ToolBox.map(output[7], -1, 1, 0, kneeAngle));
            
        }

        let guy = new Robot(brain, bodyParts, eyes, update);
        this.robots.push(guy);
        return guy;
    }

    //
    //createRoboStarfish(params = {}) {
    createRoboStarfish(brainGenome) {

        // Body
        const numLegs = 3;
        const numLegSections = 3;

        const bodyRadius = 20;
        
        const legJointMaxRadius = 15;
        const legJointMinRadius = 10;

        const legJointMinMass = 5;
        const legJointMaxMass = 10;

        // Vision
        const numRays = numLegs * 3;

        // Body
        let bodyParts = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            legs : [],
            legAnchorLinearSprings : [],
        }

        let position = new Vector2(0, 0); //.add(new Vector2(Math.random() * 100 - 200, Math.random() * 100 - 200));
        let angle = Math.PI * 2; // * Math.random();
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        var body = this.world.createParticle(position, 20, bodyRadius, randomColor);
        bodyParts.particles.push(body);

        // Legs
        for (let i = 0; i < numLegs; i++) {
            let legAngle = angle + Math.PI * 2 * i / numLegs;
            let legAngleVector = new Vector2(Math.cos(legAngle), Math.sin(legAngle));

            // Leg anchors
            var legAnchor = this.world.createParticle(position.add(legAngleVector.mul(body.radius + legJointMaxRadius)), legJointMaxMass, legJointMaxRadius, randomColor);
            bodyParts.particles.push(legAnchor);

            // Leg linear spring to body
            var legLinear = this.world.createLinearSpring(body, legAnchor, 1.0, 1.0, 0.5);
            legLinear.radius = legJointMaxRadius;
            legLinear.color = randomColor2;
            bodyParts.linearSprings.push(legLinear);
            bodyParts.legAnchorLinearSprings.push(legLinear);

            let prevLegJoint = legAnchor;
            let prevLegSection = legLinear;

            let legAngulars = [];

            for (let j = 0; j < numLegSections; j++) {
                let legJointRadius = ToolBox.map(j, 0, numLegSections-1, legJointMaxRadius, legJointMinRadius);
                //let legSectionRadius = ToolBox.map(j, 0, numLegSections - 1, 10, 5);
                let legJointMass = ToolBox.map(j, 0, numLegSections - 1, legJointMaxMass, legJointMinMass);

                // Leg joints
                var legJoint = this.world.createParticle(prevLegJoint.position.add(legAngleVector.mul(prevLegJoint.radius+legJointRadius)), legJointMass, legJointRadius, randomColor);
                bodyParts.particles.push(legJoint);

                // Leg sections
                var legSection = this.world.createLinearSpring(prevLegJoint, legJoint, 1.0, 1.0, 0.5);
                legSection.radius = legJointRadius;
                legSection.color = randomColor2;
                bodyParts.linearSprings.push(legSection);

                // Leg angular spring
                var legAngular = this.world.createAngularSpring(prevLegSection, legSection, 0.25, 0.5, 0.5);
                bodyParts.angularSprings.push(legAngular);
                legAngulars.push(legAngular);
                
                prevLegJoint = legJoint;
                prevLegSection = legSection;
            }
            bodyParts.legs.push(legAngulars);
        }

        // Create angular springs between legAnchorLinearSprings
        for (let i = 0; i < bodyParts.legAnchorLinearSprings.length; i++) {
            let legAnchorLinear1 = bodyParts.legAnchorLinearSprings[i];
            let legAnchorLinear2 = bodyParts.legAnchorLinearSprings[(i + 1) % bodyParts.legAnchorLinearSprings.length];
            let legAngular = this.world.createAngularSpring(legAnchorLinear1, legAnchorLinear2, 0.5, 0.5, 0.5);
            bodyParts.angularSprings.push(legAngular);
        }

        //console.log(bodyParts);

        // Create vision
        let visionParams = {
            position : new Vector2(0, 0),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        let brainParams = {
            layers : [numRays, 16, numLegs],
            activation : {
                func : ActivationFunctions.invParametricTanhLike,
            },
        }

        //let brain = this.createNeuralNetwork(params.brain.genome, brainParams);
        let brain = this.createNeuralNetwork(brainGenome, brainParams);

        let update = function update() {
            // Update eyes
            const angleVector = this.body.linearSprings[0].angleVector;
            this.eyes.directionVector = angleVector;
            this.eyes.origin = this.body.particles[0].position;
    
            this.eyes.update();
    
            // Update brain
            let inputs = [];
    
            let intersections = this.eyes.getOutput();
            
            for (let i = 0; i < intersections.length; i++) {
                inputs.push(intersections[i] ? intersections[i].intersection.distance : 10000);
            }
    
            this.brain.setInput(inputs);
            this.brain.run();
            let output = this.brain.getOutput();
    
            let legAngle = Math.PI * 2 * 0.166;
    
            // Update body
            for (let i = 0 ; i < numLegs ; i++) {
                
                let angle = ToolBox.map(output[i], -1, 1, -legAngle, legAngle);

                for (let j = 0; j < this.body.legs[i].length; j++) {
                    this.body.legs[i][j].setRestAngleVector(angle);
                }
            }
        }

        let starfish = new Robot(brain, bodyParts, eyes, update);
        this.robots.push(starfish);
        return starfish;
    }

    //createRoboCrab(params = {}) {
    createRoboCrab(brainGenome) {

        let bodyParts = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            leftLeg1AngularSprings : [],
            leftLeg2AngularSprings : [],
            rightLeg1AngularSprings : [],
            rightLeg2AngularSprings : [],
            leftLeg1JointAngularSpring : null,
            leftLeg2JointAngularSpring : null,
            rightLeg1JointAngularSpring : null,
            rightLeg2JointAngularSpring : null,
        }

        let position = new Vector2(200, 200); //new Vector2(0, 0);
        let bigLegSectionLength = 32;
        let smallLegSectionLength = 18;
        let legSectionRadius = 10;
        let legJointRadius = 8;
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Body
        var body = this.world.createParticle(position, 10, 30, randomColor);
        bodyParts.particles.push(body);

        // Leg anchors
        var leftLegAnchor  = this.world.createParticle(position.add(new Vector2(-(body.radius+legJointRadius+2), 0)), 5, legJointRadius, randomColor);
        var rightLegAnchor = this.world.createParticle(position.add(new Vector2( (body.radius+legJointRadius+2), 0)), 5, legJointRadius, randomColor);

        var leftLegLinear = this.world.createLinearSpring(body, leftLegAnchor, 1.0, 1.0, 0.5);
        var rightLegLinear = this.world.createLinearSpring(body, rightLegAnchor, 1.0, 1.0, 0.5);
        leftLegLinear.radius = legSectionRadius;
        rightLegLinear.radius = legSectionRadius;
        leftLegLinear.color = randomColor2;
        rightLegLinear.color = randomColor2;

        var legAngular = this.world.createAngularSpring(leftLegLinear, rightLegLinear, 0.5, 0.5, 0.5)

        // Articulated legs

        // Left leg 1
        //var leftLeg1Joint1 = this.world.createLinearState(leftLegAnchor.position.add(new Vector2(-30, -50)), 1.0);
        var leftLeg1Joint1 = this.world.createParticle(leftLegAnchor.position.add(new Vector2(-bigLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg1Joint2 = this.world.createParticle(leftLeg1Joint1.position.add(new Vector2(-bigLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg1Foot = this.world.createParticle(leftLeg1Joint2.position.add(new Vector2(-bigLegSectionLength, 0)), 5, legJointRadius, randomColor);
        bodyParts.particles.push(leftLeg1Joint1);
        bodyParts.particles.push(leftLeg1Joint2);
        bodyParts.particles.push(leftLeg1Foot);

        var leftLeg1Section1 = this.world.createLinearSpring(leftLegAnchor, leftLeg1Joint1, 1.0, 1.0, 0.5);
        var leftLeg1Section2 = this.world.createLinearSpring(leftLeg1Joint1, leftLeg1Joint2, 1.0, 1.0, 0.5);
        var leftLeg1Section3 = this.world.createLinearSpring(leftLeg1Joint2, leftLeg1Foot, 1.0, 1.0, 0.5);
        leftLeg1Section1.radius = legSectionRadius;
        leftLeg1Section2.radius = legSectionRadius;
        leftLeg1Section3.radius = legSectionRadius;
        leftLeg1Section1.color = randomColor2;
        leftLeg1Section2.color = randomColor2;
        leftLeg1Section3.color = randomColor2;

        var leftLeg1Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg1Section1, 0.25, 0.5, 0.5);
        var leftLeg1Angular2 = this.world.createAngularSpring(leftLeg1Section1, leftLeg1Section2, 0.25, 0.5, 0.5);
        var leftLeg1Angular3 = this.world.createAngularSpring(leftLeg1Section2, leftLeg1Section3, 0.25, 0.5, 0.5);
        
        bodyParts.leftLeg1JointAngularSpring = leftLeg1Angular1;
        bodyParts.leftLeg1AngularSprings.push(leftLeg1Angular2);
        bodyParts.leftLeg1AngularSprings.push(leftLeg1Angular3);

        // Left leg 2
        var leftLeg2Joint1 = this.world.createParticle(leftLegAnchor.position.add(new Vector2(-smallLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg2Joint2 = this.world.createParticle(leftLeg2Joint1.position.add(new Vector2(-smallLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg2Foot = this.world.createParticle(leftLeg2Joint2.position.add(new Vector2(-smallLegSectionLength, 0)), 5, legJointRadius, randomColor);

        var leftLeg2Section1 = this.world.createLinearSpring(leftLegAnchor, leftLeg2Joint1, 1.0, 1.0, 0.5);
        var leftLeg2Section2 = this.world.createLinearSpring(leftLeg2Joint1, leftLeg2Joint2, 1.0, 1.0, 0.5);
        var leftLeg2Section3 = this.world.createLinearSpring(leftLeg2Joint2, leftLeg2Foot, 1.0, 1.0, 0.5);
        leftLeg2Section1.radius = legSectionRadius;
        leftLeg2Section2.radius = legSectionRadius;
        leftLeg2Section3.radius = legSectionRadius;
        leftLeg2Section1.color = randomColor2;
        leftLeg2Section2.color = randomColor2;
        leftLeg2Section3.color = randomColor2;

        var leftLeg2Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg2Section1, 0.25, 0.5, 0.5);
        var leftLeg2Angular2 = this.world.createAngularSpring(leftLeg2Section1, leftLeg2Section2, 0.25, 0.5, 0.5);
        var leftLeg2Angular3 = this.world.createAngularSpring(leftLeg2Section2, leftLeg2Section3, 0.25, 0.5, 0.5);

        bodyParts.leftLeg2JointAngularSpring = leftLeg2Angular1;
        bodyParts.leftLeg2AngularSprings.push(leftLeg2Angular2);
        bodyParts.leftLeg2AngularSprings.push(leftLeg2Angular3);

        // Right leg 1
        var rightLeg1Joint1 = this.world.createParticle(rightLegAnchor.position.add(new Vector2(bigLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg1Joint2 = this.world.createParticle(rightLeg1Joint1.position.add(new Vector2(bigLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg1Foot = this.world.createParticle(rightLeg1Joint2.position.add(new Vector2(bigLegSectionLength, 0)), 5, legJointRadius, randomColor);

        var rightLeg1Section1 = this.world.createLinearSpring(rightLegAnchor, rightLeg1Joint1, 1.0, 1.0, 0.5);
        var rightLeg1Section2 = this.world.createLinearSpring(rightLeg1Joint1, rightLeg1Joint2, 1.0, 1.0, 0.5);
        var rightLeg1Section3 = this.world.createLinearSpring(rightLeg1Joint2, rightLeg1Foot, 1.0, 1.0, 0.5);
        rightLeg1Section1.radius = legSectionRadius;
        rightLeg1Section2.radius = legSectionRadius;
        rightLeg1Section3.radius = legSectionRadius;
        rightLeg1Section1.color = randomColor2;
        rightLeg1Section2.color = randomColor2;
        rightLeg1Section3.color = randomColor2;

        var rightLeg1Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg1Section1, 0.25, 0.5, 0.5);
        var rightLeg1Angular2 = this.world.createAngularSpring(rightLeg1Section1, rightLeg1Section2, 0.25, 0.5, 0.5);
        var rightLeg1Angular3 = this.world.createAngularSpring(rightLeg1Section2, rightLeg1Section3, 0.25, 0.5, 0.5);

        bodyParts.rightLeg1JointAngularSpring = rightLeg1Angular1;
        bodyParts.rightLeg1AngularSprings.push(rightLeg1Angular2);
        bodyParts.rightLeg1AngularSprings.push(rightLeg1Angular3);

        // Right leg 2
        var rightLeg2Joint1 = this.world.createParticle(rightLegAnchor.position.add(new Vector2(smallLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg2Joint2 = this.world.createParticle(rightLeg2Joint1.position.add(new Vector2(smallLegSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg2Foot = this.world.createParticle(rightLeg2Joint2.position.add(new Vector2(smallLegSectionLength, 0)), 5, legJointRadius, randomColor);

        var rightLeg2Section1 = this.world.createLinearSpring(rightLegAnchor, rightLeg2Joint1, 1.0, 1.0, 0.5);
        var rightLeg2Section2 = this.world.createLinearSpring(rightLeg2Joint1, rightLeg2Joint2, 1.0, 1.0, 0.5);
        var rightLeg2Section3 = this.world.createLinearSpring(rightLeg2Joint2, rightLeg2Foot, 1.0, 1.0, 0.5);
        rightLeg2Section1.radius = legSectionRadius;
        rightLeg2Section2.radius = legSectionRadius;
        rightLeg2Section3.radius = legSectionRadius;
        rightLeg2Section1.color = randomColor2;
        rightLeg2Section2.color = randomColor2;
        rightLeg2Section3.color = randomColor2;

        var rightLeg2Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg2Section1, 0.25, 0.5, 0.5);
        var rightLeg2Angular2 = this.world.createAngularSpring(rightLeg2Section1, rightLeg2Section2, 0.25, 0.5, 0.5);
        var rightLeg2Angular3 = this.world.createAngularSpring(rightLeg2Section2, rightLeg2Section3, 0.25, 0.5, 0.5);

        bodyParts.rightLeg2JointAngularSpring = rightLeg2Angular1;
        bodyParts.rightLeg2AngularSprings.push(rightLeg2Angular2);
        bodyParts.rightLeg2AngularSprings.push(rightLeg2Angular3);

        // Push all Particles, LiearSprings and AngularSprings to BodyParts arrays
        bodyParts.angularSprings.push(legAngular);
        bodyParts.angularSprings.push(leftLeg1Angular1);
        bodyParts.angularSprings.push(leftLeg1Angular2);
        bodyParts.angularSprings.push(leftLeg1Angular3);
        bodyParts.angularSprings.push(leftLeg2Angular1);
        bodyParts.angularSprings.push(leftLeg2Angular2);
        bodyParts.angularSprings.push(leftLeg2Angular3);
        bodyParts.angularSprings.push(rightLeg1Angular1);
        bodyParts.angularSprings.push(rightLeg1Angular2);
        bodyParts.angularSprings.push(rightLeg1Angular3);
        bodyParts.angularSprings.push(rightLeg2Angular1);
        bodyParts.angularSprings.push(rightLeg2Angular2);
        bodyParts.angularSprings.push(rightLeg2Angular3);

        bodyParts.linearSprings.push(leftLegLinear);
        bodyParts.linearSprings.push(rightLegLinear);
        bodyParts.linearSprings.push(leftLeg1Section1);
        bodyParts.linearSprings.push(leftLeg1Section2);
        bodyParts.linearSprings.push(leftLeg1Section3);
        bodyParts.linearSprings.push(leftLeg2Section1);
        bodyParts.linearSprings.push(leftLeg2Section2);
        bodyParts.linearSprings.push(leftLeg2Section3);
        bodyParts.linearSprings.push(rightLeg1Section1);
        bodyParts.linearSprings.push(rightLeg1Section2);
        bodyParts.linearSprings.push(rightLeg1Section3);
        bodyParts.linearSprings.push(rightLeg2Section1);
        bodyParts.linearSprings.push(rightLeg2Section2);
        bodyParts.linearSprings.push(rightLeg2Section3);

        bodyParts.particles.push(body);
        bodyParts.particles.push(leftLegAnchor);
        bodyParts.particles.push(rightLegAnchor);
        bodyParts.particles.push(leftLeg1Joint1);
        bodyParts.particles.push(leftLeg1Joint2);
        bodyParts.particles.push(leftLeg1Foot);
        bodyParts.particles.push(leftLeg2Joint1);
        bodyParts.particles.push(leftLeg2Joint2);
        bodyParts.particles.push(leftLeg2Foot);
        bodyParts.particles.push(rightLeg1Joint1);
        bodyParts.particles.push(rightLeg1Joint2);
        bodyParts.particles.push(rightLeg1Foot);
        bodyParts.particles.push(rightLeg2Joint1);
        bodyParts.particles.push(rightLeg2Joint2);
        bodyParts.particles.push(rightLeg2Foot);

        // let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        // let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        // Create vision
        let numRays = 12;

        let visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        let brainParams = {
            layers : [numRays, 16, 8],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
            },
        }

        //let brain = this.createNeuralNetwork(params.brain.genome, brainParams);
        let brain = this.createNeuralNetwork(brainGenome, brainParams);

        let update = function update() {
            // Update eyes
            
            const angleVector = this.body.linearSprings[1].angleVector;
            this.eyes.directionVector = angleVector.perp();
            this.eyes.origin = this.body.particles[0].position;
    
            this.eyes.update();
    
            // Update brain
            let inputs = [];
    
            let intersections = this.eyes.getOutput();
            
            for (let i = 0; i < intersections.length; i++) {
                inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
            }
    
            this.brain.setInput(inputs);
            this.brain.run();
            let output = this.brain.getOutput();
    
            let jointAngle = Math.PI * 2 * 0.15;
            let legAngle = Math.PI * 2 * 0.15;
    
            // Update body
            let angle = ToolBox.map(output[0], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.leftLeg1AngularSprings.length; i++) {
                this.body.leftLeg1AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[1], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.leftLeg2AngularSprings.length; i++) {
                this.body.leftLeg2AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[2], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.rightLeg1AngularSprings.length; i++) {
                this.body.rightLeg1AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[3], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.rightLeg2AngularSprings.length; i++) {
                this.body.rightLeg2AngularSprings[i].setRestAngleVector(angle);
            }
    
            this.body.leftLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[4], -1, 1, -jointAngle, jointAngle));
            this.body.leftLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[5], -1, 1, -jointAngle, jointAngle));
            this.body.rightLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[6], -1, 1, -jointAngle, jointAngle));
            this.body.rightLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[7], -1, 1, -jointAngle, jointAngle));
        }

        let crab = new Robot(brain, bodyParts, eyes, update);
        this.robots.push(crab);
        return crab;
    }

    //
    createRoboCrabOld(params = {}) {

        let bodyParts = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            leftLeg1AngularSprings : [],
            leftLeg2AngularSprings : [],
            rightLeg1AngularSprings : [],
            rightLeg2AngularSprings : [],
            leftLeg1JointAngularSpring : null,
            leftLeg2JointAngularSpring : null,
            rightLeg1JointAngularSpring : null,
            rightLeg2JointAngularSpring : null,
        }

        let position = new Vector2(200, 200); //new Vector2(0, 0);
        let legSectionLength = 30;
        let legSectionRadius = 10;
        let legJointRadius = 8;
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Body
        var body = this.world.createParticle(position, 10, 30, randomColor);
        bodyParts.particles.push(body);

        // Leg anchors
        var leftLegAnchor = this.world.createParticle(position.add(new Vector2(-50, 0)), 5, legJointRadius, randomColor);
        var rightLegAnchor = this.world.createParticle(position.add(new Vector2(50, 0)), 5, legJointRadius, randomColor);

        var leftLegLinear = this.world.createLinearSpring(body, leftLegAnchor, 1.0, 1.0, 1.0);
        var rightLegLinear = this.world.createLinearSpring(body, rightLegAnchor, 1.0, 1.0, 1.0);
        leftLegLinear.radius = legSectionRadius;
        rightLegLinear.radius = legSectionRadius;
        leftLegLinear.color = randomColor2;
        rightLegLinear.color = randomColor2;

        var legAngular = this.world.createAngularSpring(leftLegLinear, rightLegLinear, 0.5, 0.5, 0.5)

        // Articulated legs

        // Left leg 1
        //var leftLeg1Joint1 = this.world.createLinearState(leftLegAnchor.position.add(new Vector2(-30, -50)), 1.0);
        var leftLeg1Joint1 = this.world.createParticle(leftLegAnchor.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg1Joint2 = this.world.createParticle(leftLeg1Joint1.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg1Foot = this.world.createParticle(leftLeg1Joint2.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);
        bodyParts.particles.push(leftLeg1Joint1);
        bodyParts.particles.push(leftLeg1Joint2);
        bodyParts.particles.push(leftLeg1Foot);

        var leftLeg1Section1 = this.world.createLinearSpring(leftLegAnchor, leftLeg1Joint1, 1.0, 1.0, 1.0);
        var leftLeg1Section2 = this.world.createLinearSpring(leftLeg1Joint1, leftLeg1Joint2, 1.0, 1.0, 1.0);
        var leftLeg1Section3 = this.world.createLinearSpring(leftLeg1Joint2, leftLeg1Foot, 1.0, 1.0, 1.0);
        leftLeg1Section1.radius = legSectionRadius;
        leftLeg1Section2.radius = legSectionRadius;
        leftLeg1Section3.radius = legSectionRadius;
        leftLeg1Section1.color = randomColor2;
        leftLeg1Section2.color = randomColor2;
        leftLeg1Section3.color = randomColor2;

        var leftLeg1Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg1Section1, 0.5, 0.5, 0.5);
        var leftLeg1Angular2 = this.world.createAngularSpring(leftLeg1Section1, leftLeg1Section2, 0.25, 0.5, 0.5);
        var leftLeg1Angular3 = this.world.createAngularSpring(leftLeg1Section2, leftLeg1Section3, 0.125, 0.5, 0.5);
        
        bodyParts.leftLeg1JointAngularSpring = leftLeg1Angular1;
        bodyParts.leftLeg1AngularSprings.push(leftLeg1Angular2);
        bodyParts.leftLeg1AngularSprings.push(leftLeg1Angular3);

        // Left leg 2
        var leftLeg2Joint1 = this.world.createParticle(leftLegAnchor.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg2Joint2 = this.world.createParticle(leftLeg2Joint1.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);
        var leftLeg2Foot = this.world.createParticle(leftLeg2Joint2.position.add(new Vector2(-legSectionLength, 0)), 5, legJointRadius, randomColor);

        var leftLeg2Section1 = this.world.createLinearSpring(leftLegAnchor, leftLeg2Joint1, 1.0, 1.0, 1.0);
        var leftLeg2Section2 = this.world.createLinearSpring(leftLeg2Joint1, leftLeg2Joint2, 1.0, 1.0, 1.0);
        var leftLeg2Section3 = this.world.createLinearSpring(leftLeg2Joint2, leftLeg2Foot, 1.0, 1.0, 1.0);
        leftLeg2Section1.radius = legSectionRadius;
        leftLeg2Section2.radius = legSectionRadius;
        leftLeg2Section3.radius = legSectionRadius;
        leftLeg2Section1.color = randomColor2;
        leftLeg2Section2.color = randomColor2;
        leftLeg2Section3.color = randomColor2;

        var leftLeg2Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg2Section1, 0.5, 0.5, 0.5);
        var leftLeg2Angular2 = this.world.createAngularSpring(leftLeg2Section1, leftLeg2Section2, 0.25, 0.5, 0.5);
        var leftLeg2Angular3 = this.world.createAngularSpring(leftLeg2Section2, leftLeg2Section3, 0.125, 0.5, 0.5);

        bodyParts.leftLeg2JointAngularSpring = leftLeg2Angular1;
        bodyParts.leftLeg2AngularSprings.push(leftLeg2Angular2);
        bodyParts.leftLeg2AngularSprings.push(leftLeg2Angular3);

        // Right leg 1
        var rightLeg1Joint1 = this.world.createParticle(rightLegAnchor.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg1Joint2 = this.world.createParticle(rightLeg1Joint1.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg1Foot = this.world.createParticle(rightLeg1Joint2.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);

        var rightLeg1Section1 = this.world.createLinearSpring(rightLegAnchor, rightLeg1Joint1, 1.0, 1.0, 1.0);
        var rightLeg1Section2 = this.world.createLinearSpring(rightLeg1Joint1, rightLeg1Joint2, 1.0, 1.0, 1.0);
        var rightLeg1Section3 = this.world.createLinearSpring(rightLeg1Joint2, rightLeg1Foot, 1.0, 1.0, 1.0);
        rightLeg1Section1.radius = legSectionRadius;
        rightLeg1Section2.radius = legSectionRadius;
        rightLeg1Section3.radius = legSectionRadius;
        rightLeg1Section1.color = randomColor2;
        rightLeg1Section2.color = randomColor2;
        rightLeg1Section3.color = randomColor2;

        var rightLeg1Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg1Section1, 0.5, 0.5, 0.5);
        var rightLeg1Angular2 = this.world.createAngularSpring(rightLeg1Section1, rightLeg1Section2, 0.25, 0.5, 0.5);
        var rightLeg1Angular3 = this.world.createAngularSpring(rightLeg1Section2, rightLeg1Section3, 0.125, 0.5, 0.5);

        bodyParts.rightLeg1JointAngularSpring = rightLeg1Angular1;
        bodyParts.rightLeg1AngularSprings.push(rightLeg1Angular2);
        bodyParts.rightLeg1AngularSprings.push(rightLeg1Angular3);

        // Right leg 2
        var rightLeg2Joint1 = this.world.createParticle(rightLegAnchor.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg2Joint2 = this.world.createParticle(rightLeg2Joint1.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);
        var rightLeg2Foot = this.world.createParticle(rightLeg2Joint2.position.add(new Vector2(legSectionLength, 0)), 5, legJointRadius, randomColor);

        var rightLeg2Section1 = this.world.createLinearSpring(rightLegAnchor, rightLeg2Joint1, 1.0, 1.0, 1.0);
        var rightLeg2Section2 = this.world.createLinearSpring(rightLeg2Joint1, rightLeg2Joint2, 1.0, 1.0, 1.0);
        var rightLeg2Section3 = this.world.createLinearSpring(rightLeg2Joint2, rightLeg2Foot, 1.0, 1.0, 1.0);
        rightLeg2Section1.radius = legSectionRadius;
        rightLeg2Section2.radius = legSectionRadius;
        rightLeg2Section3.radius = legSectionRadius;
        rightLeg2Section1.color = randomColor2;
        rightLeg2Section2.color = randomColor2;
        rightLeg2Section3.color = randomColor2;

        var rightLeg2Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg2Section1, 0.5, 0.5, 0.5);
        var rightLeg2Angular2 = this.world.createAngularSpring(rightLeg2Section1, rightLeg2Section2, 0.25, 0.5, 0.5);
        var rightLeg2Angular3 = this.world.createAngularSpring(rightLeg2Section2, rightLeg2Section3, 0.125, 0.5, 0.5);

        bodyParts.rightLeg2JointAngularSpring = rightLeg2Angular1;
        bodyParts.rightLeg2AngularSprings.push(rightLeg2Angular2);
        bodyParts.rightLeg2AngularSprings.push(rightLeg2Angular3);

        // Push all Particles, LiearSprings and AngularSprings to BodyParts arrays
        bodyParts.angularSprings.push(legAngular);
        bodyParts.angularSprings.push(leftLeg1Angular1);
        bodyParts.angularSprings.push(leftLeg1Angular2);
        bodyParts.angularSprings.push(leftLeg1Angular3);
        bodyParts.angularSprings.push(leftLeg2Angular1);
        bodyParts.angularSprings.push(leftLeg2Angular2);
        bodyParts.angularSprings.push(leftLeg2Angular3);
        bodyParts.angularSprings.push(rightLeg1Angular1);
        bodyParts.angularSprings.push(rightLeg1Angular2);
        bodyParts.angularSprings.push(rightLeg1Angular3);
        bodyParts.angularSprings.push(rightLeg2Angular1);
        bodyParts.angularSprings.push(rightLeg2Angular2);
        bodyParts.angularSprings.push(rightLeg2Angular3);

        bodyParts.linearSprings.push(leftLegLinear);
        bodyParts.linearSprings.push(rightLegLinear);
        bodyParts.linearSprings.push(leftLeg1Section1);
        bodyParts.linearSprings.push(leftLeg1Section2);
        bodyParts.linearSprings.push(leftLeg1Section3);
        bodyParts.linearSprings.push(leftLeg2Section1);
        bodyParts.linearSprings.push(leftLeg2Section2);
        bodyParts.linearSprings.push(leftLeg2Section3);
        bodyParts.linearSprings.push(rightLeg1Section1);
        bodyParts.linearSprings.push(rightLeg1Section2);
        bodyParts.linearSprings.push(rightLeg1Section3);
        bodyParts.linearSprings.push(rightLeg2Section1);
        bodyParts.linearSprings.push(rightLeg2Section2);
        bodyParts.linearSprings.push(rightLeg2Section3);

        bodyParts.particles.push(body);
        bodyParts.particles.push(leftLegAnchor);
        bodyParts.particles.push(rightLegAnchor);
        bodyParts.particles.push(leftLeg1Joint1);
        bodyParts.particles.push(leftLeg1Joint2);
        bodyParts.particles.push(leftLeg1Foot);
        bodyParts.particles.push(leftLeg2Joint1);
        bodyParts.particles.push(leftLeg2Joint2);
        bodyParts.particles.push(leftLeg2Foot);
        bodyParts.particles.push(rightLeg1Joint1);
        bodyParts.particles.push(rightLeg1Joint2);
        bodyParts.particles.push(rightLeg1Foot);
        bodyParts.particles.push(rightLeg2Joint1);
        bodyParts.particles.push(rightLeg2Joint2);
        bodyParts.particles.push(rightLeg2Foot);

        // let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        // let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        // Create vision
        let numRays = 12;

        let visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        let brainParams = {
            layers : [numRays, 16, 8],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
            },
        }

        let brain = this.createNeuralNetwork(params.brain.genome, brainParams);

        let update = function update() {
            // Update eyes
            
            //const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
            const angleVector = this.body.linearSprings[1].angleVector;
            this.eyes.directionVector = angleVector.perp();
            //this.eyes.origin = this.body.particles[0].position.add(angleVector.mul(this.body.particles[0].radius));
            this.eyes.origin = this.body.particles[0].position;
    
            this.eyes.update();
    
            // Update brain
            let inputs = [];
    
            let intersections = this.eyes.getOutput();
            //console.log(intersections)
            
            for (let i = 0; i < intersections.length; i++) {
                inputs.push(intersections[i] ? intersections[i].intersection.distance : Infinity);
            }
    
            this.brain.setInput(inputs);
            this.brain.run();
            let output = this.brain.getOutput();
    
            let jointAngle = Math.PI * 2 * 0.15;
            let legAngle = Math.PI * 2 * 0.15;
    
            // Update body
            let angle = ToolBox.map(output[0], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.leftLeg1AngularSprings.length; i++) {
                this.body.leftLeg1AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[1], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.leftLeg2AngularSprings.length; i++) {
                this.body.leftLeg2AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[2], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.rightLeg1AngularSprings.length; i++) {
                this.body.rightLeg1AngularSprings[i].setRestAngleVector(angle);
            }
    
            angle = ToolBox.map(output[3], -1, 1, -legAngle, legAngle);
    
            for (let i = 0; i < this.body.rightLeg2AngularSprings.length; i++) {
                this.body.rightLeg2AngularSprings[i].setRestAngleVector(angle);
            }
    
            this.body.leftLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[4], -1, 1, -jointAngle, jointAngle));
            this.body.leftLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[5], -1, 1, -jointAngle, jointAngle));
            this.body.rightLeg1JointAngularSpring.setRestAngleVector( ToolBox.map(output[6], -1, 1, -jointAngle, jointAngle));
            this.body.rightLeg2JointAngularSpring.setRestAngleVector( ToolBox.map(output[7], -1, 1, -jointAngle, jointAngle));
        }
        
        let crab = new Robot(brain, bodyParts, eyes, update);
        this.robots.push(crab);
        return crab;
    }

    //
    //createRoboWorm(params = {}) {
    createRoboWorm(brainGenome) {
        
        const bodyParams = {
            position : new Vector2(800, 200),
            numSegments : 10,
            radius : 14,
            mass : 2,
        }
        
        let body = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
        }

        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        
        for (let i = 0; i < bodyParams.numSegments; i++) {
            let particle = this.world.createParticle(bodyParams.position, bodyParams.mass, bodyParams.radius, randomColor);
            bodyParams.position = bodyParams.position.sub(new Vector2(bodyParams.radius * 2.2, 0));
            body.particles.push(particle);
        }

        // Connect particles with linear springs
        for (let i = 0; i < body.particles.length - 1; i++) {
            let linearSpring = this.world.createLinearSpring(body.particles[i], body.particles[i+1], 1, 1, 0.5);
            linearSpring.radius = 16;
            linearSpring.color = randomColor2;
            body.linearSprings.push(linearSpring);
        }

        // Connect linearSprings with angular springs
        for (let i = 0; i < body.linearSprings.length - 1; i++) {
            let angularSpring = this.world.createAngularSpring(body.linearSprings[i], body.linearSprings[i+1], 0.125, 0.25, 0.5);
            body.angularSprings.push(angularSpring);
        }
        
        // let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        // let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        // Create vision
        const numRays = 7;

        const visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fov : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fov);

        // Create brain
        const brainParams = {
            layers : [numRays, 16, bodyParams.numSegments-2],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
            },
        }

        //let brain = this.createNeuralNetwork(params.brain.genome, brainParams);
        let brain = this.createNeuralNetwork(brainGenome, brainParams);

        let update = function update() {
            // Update eyes
            const angleVector = this.body.particles[0].position.sub(this.body.particles[1].position).normalize();
            this.eyes.directionVector = angleVector;
            this.eyes.origin = this.body.particles[0].position;
    
            this.eyes.update();
    
            // Update brain
            let inputs = [];
    
            let intersections = this.eyes.getOutput();
            
            for (let i = 0; i < intersections.length; i++) {
                inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
            }
    
            this.brain.setInput(inputs);
            
            this.brain.run();
            let output = this.brain.getOutput();
    
            // Update body
            for (let i = 0; i < this.body.angularSprings.length; i++) {
                this.body.angularSprings[i].setRestAngleVector(output[i] * Math.PI * 2 * 0.125);
            }
        }

        let robot = new Robot(brain, body, eyes, update);
        this.robots.push(robot);
        return robot;
    }

    //
    createIndividual(params = {}) {
        let individual = new Individual(params.genome, params.fitness);
        this.deadIndividuals.push(individual);
        return individual;
    }
    deleteIndividual(individual) {
        this.individuals.splice(this.individuals.indexOf(individual), 1);
        this.deadIndividuals.push(individual);
    }

    //
    createNeuralNetwork(genome, params) {
        let neuralNetwork = new Network(genome, params);
        this.neuralNetworks.push(neuralNetwork);
        return neuralNetwork;
    }
    deleteNeuralNetwork(neuralNetwork) {
        this.neuralNetworks.splice(this.neuralNetworks.indexOf(neuralNetwork), 1);
    }

    //
    createRay(origin, direction) {
        let ray = new Ray(origin, direction);
        this.rays.push(ray);
        return ray;
    }
    deleteRay(ray) {
        this.rays.splice(this.rays.indexOf(ray), 1);
    }

    //
    createRayCamera(origin, direction, numRays, width) {
        let rayCamera = new RayCamera(origin, direction, numRays, width);
        this.rayCameras.push(rayCamera);
        return rayCamera;
    }
    deleteRayCamera(rayCamera) {
        this.rayCameras.splice(this.rayCameras.indexOf(rayCamera), 1);
    }
}

export { Simulation };