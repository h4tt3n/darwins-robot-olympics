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
import { MotorConstraint } from '../../physics-engine/version-01/constraints/motorConstraint.js';

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
        if (robot.body.motorConstraints != undefined) {
            for (let i = 0; i < robot.body.motorConstraints.length; i++) {
                this.world.deleteMotorConstraint(robot.body.motorConstraints[i]);
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
        if (robot.body.angularStates != undefined) {
            for (let i = 0; i < robot.body.angularStates.length; i++) {
                this.world.deleteAngularState(robot.body.angularStates[i]);
            }
        }
        if (robot.body.linearStates != undefined) {
            for (let i = 0; i < robot.body.linearStates.length; i++) {
                this.world.deleteLinearState(robot.body.linearStates[i]);
            }
        }
        // Delete robot
        this.robots.splice(this.robots.indexOf(robot), 1);
        this.deadRobots.push(robot);
    }

    //
    createRobotBody(world, bodyParams = {}) {
            
        const body = new Map();

        if (bodyParams.linearStates != undefined) {
            for( let i = 0; i < bodyParams.linearStates.length; i++) {
                let linearState = world.createLinearState(
                    bodyParams.linearStates[i].args.position,
                    bodyParams.linearStates[i].args.mass,
                    bodyParams.linearStates[i].args.radius
                );
                body.set(bodyParams.linearStates[i].name, linearState);
            }
        }
        
        if (bodyParams.particles != undefined) {
            for( let i = 0; i < bodyParams.particles.length; i++) {
                let particle = world.createParticle(
                    bodyParams.particles[i].args.position, 
                    bodyParams.particles[i].args.mass, 
                    bodyParams.particles[i].args.radius,
                    bodyParams.particles[i].args.color
                );
                body.set(bodyParams.particles[i].name, particle);
            }
        }

        if (bodyParams.angularStates != undefined) {
            for( let i = 0; i < bodyParams.angularStates.length; i++) {
                let angularState = world.createAngularState(
                    bodyParams.angularStates[i].args.position, 
                    bodyParams.angularStates[i].args.mass, 
                    bodyParams.angularStates[i].args.angle, 
                    bodyParams.angularStates[i].args.inertia
                );
                body.set(bodyParams.angularStates[i].name, angularState);
            }
        }

        if (bodyParams.wheels != undefined) {
            for( let i = 0; i < bodyParams.wheels.length; i++) {
                let wheel = world.createWheel(
                    bodyParams.wheels[i].args.position, 
                    bodyParams.wheels[i].args.mass, 
                    bodyParams.wheels[i].args.angle, 
                    bodyParams.wheels[i].args.inertia, 
                    bodyParams.wheels[i].args.radius
                );
                body.set(bodyParams.wheels[i].name, wheel);
            }
        }

        if (bodyParams.fixedSprings != undefined) {
            for( let i = 0; i < bodyParams.fixedSprings.length; i++) {
                let fixedSpring = world.createFixedSpring(
                    body.get(bodyParams.fixedSprings[i].args.linearStateA),
                    body.get(bodyParams.fixedSprings[i].args.linearStateB),
                    bodyParams.fixedSprings[i].args.stiffness, 
                    bodyParams.fixedSprings[i].args.damping, 
                    bodyParams.fixedSprings[i].args.warmStart
                );
                body.set(bodyParams.fixedSprings[i].name, fixedSpring);
            }
        }

        if (bodyParams.linearSprings != undefined) {
            for( let i = 0; i < bodyParams.linearSprings.length; i++) {
                let linearSpring = world.createLinearSpring(
                    body.get(bodyParams.linearSprings[i].args.linearStateA),
                    body.get(bodyParams.linearSprings[i].args.linearStateB),
                    bodyParams.linearSprings[i].args.stiffness,
                    bodyParams.linearSprings[i].args.damping,
                    bodyParams.linearSprings[i].args.warmStart
                );
                body.set(bodyParams.linearSprings[i].name, linearSpring);
            }
        }

        if (bodyParams.angularSprings != undefined) {
            for( let i = 0; i < bodyParams.angularSprings.length; i++) {
                let angularSpring = world.createAngularSpring(
                    body.get(bodyParams.angularSprings[i].args.angularStateA),
                    body.get(bodyParams.angularSprings[i].args.angularStateB),
                    bodyParams.angularSprings[i].args.stiffness,
                    bodyParams.angularSprings[i].args.damping,
                    bodyParams.angularSprings[i].args.warmStart
                );
                body.set(bodyParams.angularSprings[i].name, angularSpring);
            }
        }

        if (bodyParams.gearConstraints != undefined) {
            for( let i = 0; i < bodyParams.gearConstraints.length; i++) {
                let gearConstraint = world.createGearConstraint(
                    body.get(bodyParams.gearConstraints[i].args.linearStateA),
                    body.get(bodyParams.gearConstraints[i].args.linearStateB),
                    bodyParams.gearConstraints[i].args.ratio,
                    bodyParams.gearConstraints[i].args.stiffness,
                    bodyParams.gearConstraints[i].args.damping,
                    bodyParams.gearConstraints[i].args.warmStart
                );
                body.set(bodyParams.gearConstraints[i].name, gearConstraint);
            }
        }

        if (bodyParams.motorConstraints != undefined) {
            for( let i = 0; i < bodyParams.motorConstraints.length; i++) {
                let motorConstraint = world.createMotorConstraint(
                    body.get(bodyParams.motorConstraints[i].args.angularStateA),
                    body.get(bodyParams.motorConstraints[i].args.angularStateB),
                    bodyParams.motorConstraints[i].args.restVelocity,
                    bodyParams.motorConstraints[i].args.stiffness,
                    bodyParams.motorConstraints[i].args.damping,
                    bodyParams.motorConstraints[i].args.warmStart
                );
                body.set(bodyParams.motorConstraints[i].name, motorConstraint);
            }
        }

        return body;
    }

    //
    //createRobot(params = {}) {
    createRobot(params = {}, brainGenome) {
        
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

                // Update camera position and angle
                this.eyes.origin = wheel.position;
                this.eyes.directionVector = wheel.angleVector;
        
                // Update camera
                let intersections = this.eyes.getOutput();
        
                // Input camera data to neural network
                let inputs = [];
                
                for (let i = 0; i < intersections.length; i++) {
                    //inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
                    
                    let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                    // invDistance = ToolBox.map(invDistance, 0, 1, -1, 1);
                    // invDistance = (invDistance * 2) - 1;
                    inputs.push(intersections[i] ? invDistance : 0.0);
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
                
                // Rotation
                wheel.angularImpulse = 0.0;
                wheel.angularVelocity = 0.0;
                wheel.angle += deltaAngle;
                wheel.computeAngleVector();

                // Movement in forward direction (kinematic)
                wheel.velocity = Vector2.zero;
                wheel.impulse = constants.GRAVITY.mul(new Vector2(0, -1));
                wheel.addPosition(wheel.angleVector.mul(ToolBox.map(output[1], -1, 1, 0.0, 5.0)));
            },
        }

        params = robotParams;

        // Create brain
        const brain = this.createNeuralNetwork(brainGenome, params.brain);

        // Create body
        const body = this.createRobotBody(this.world, params.body);
        
        // Create vision
        const vision = this.createRayCamera(params.sensors.vision);

        // Create robot
        let tracker = new Robot(brain, body, vision, params.updateFunc);
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
            angularStates : [],
        }

        let position = new Vector2(0, 200); //new Vector2(0, 0);
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Wheels
        let wheelRadius = 40;
        let wheelMass = 10;
        //let engine = this.world.createWheel(position.add(new Vector2(0, -100)), wheelMass * 2, 0, null, wheelRadius);
        let engineInertia = 0.5 * wheelMass * wheelRadius * wheelRadius;
        let engine = this.world.createAngularState(position.add(new Vector2(0, -100)), wheelMass * 2, 0, engineInertia);
        let wheel1 = this.world.createWheel(position.add(new Vector2(-100, 0)), wheelMass, 0, null, wheelRadius);
        let wheel2 = this.world.createWheel(position.add(new Vector2(100, 0)), wheelMass, 0, null, wheelRadius);
        engine.color = randomColor;
        wheel1.color = randomColor;
        wheel2.color = randomColor;
        //body.wheels.push(engine);
        body.angularStates.push(engine);
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
            fieldOfView : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        //let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fieldOfView);
        let eyes = this.createRayCamera(visionParams);

        // Create brain
        let brainParams = {
            //layers : [7, 24, 8],
            layers : [numRays, 24, 4],
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
            let intersections = this.eyes.getOutput();
    
            // Input camera data to neural network
            let inputs = [];
            
            for (let i = 0; i < intersections.length; i++) {
                //inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
                let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                inputs.push(intersections[i] ? invDistance : 0.0);
            }

            this.brain.setInput(inputs);
    
            // Run neural network
            this.brain.run();
    
            // Get output from neural network
            let output = this.brain.getOutput();
    
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
                var legAngular = this.world.createAngularSpring(prevLegSection, legSection, 0.125, 1.0, 0.5);
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
            let legAngular = this.world.createAngularSpring(legAnchorLinear1, legAnchorLinear2, 0.5, 1.0, 0.5);
            bodyParts.angularSprings.push(legAngular);
        }

        //console.log(bodyParts);

        // Create vision
        let visionParams = {
            position : new Vector2(0, 0),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fieldOfView : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        //let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fieldOfView);
        let eyes = this.createRayCamera(visionParams);

        // Create brain
        let brainParams = {
            layers : [numRays, 24, numLegs],
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
                //inputs.push(intersections[i] ? intersections[i].intersection.distance : 10000);
                let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                inputs.push(intersections[i] ? invDistance : 0.0);
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

    //
    //createRoboWorm(params = {}) {
    createRoboWorm(brainGenome) {
        
        const numRays = 7;

        const bodyParams = {
            position : new Vector2(0, 200),
            numSegments : 10,
            radius : 14,
            mass : 2,
        }

        const visionParams = {
            position : new Vector2(0, 200),
            direction : Math.PI * 2 * 0,
            numRays : numRays,
            fieldOfView : Math.PI * 2 * 1 - Math.PI * 2 * (1/numRays),
        }

        const brainParams = {
            layers : [numRays, 24, bodyParams.numSegments-2],
            activation : {
                func : ActivationFunctions.parametricTanhLike,
            },
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
            let linearSpring = this.world.createLinearSpring(body.particles[i], body.particles[i+1], 1.0, 1.0, 0.5);
            linearSpring.radius = 16;
            linearSpring.color = randomColor2;
            body.linearSprings.push(linearSpring);
        }

        // Connect linearSprings with angular springs
        for (let i = 0; i < body.linearSprings.length - 1; i++) {
            let angularSpring = this.world.createAngularSpring(body.linearSprings[i], body.linearSprings[i+1], 0.25, 0.5, 0.5);
            body.angularSprings.push(angularSpring);
        }
        
        // let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        // let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fieldOfView);

        // Create vision
        //let eyes = this.createRayCamera(visionParams.position, visionParams.direction, visionParams.numRays, visionParams.fieldOfView);
        let eyes = this.createRayCamera(visionParams);

        // Create brain
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
                if( intersections[i] ) {
                //inputs.push(intersections[i] ? intersections[i].intersection.distance : 100000);
                let invDistance = 1.0 / (1.0 + intersections[i].intersection.distance);
                inputs.push(invDistance);
                }
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
    // createRayCamera(origin, direction, numRays, width) {
    //     let rayCamera = new RayCamera(origin, direction, numRays, width);
    //     this.rayCameras.push(rayCamera);
    //     return rayCamera;
    // }
    createRayCamera(params = {}) {
        let rayCamera = new RayCamera(params.position, params.direction, params.numRays, params.fieldOfView);
        this.rayCameras.push(rayCamera);
        return rayCamera;
    }
    deleteRayCamera(rayCamera) {
        this.rayCameras.splice(this.rayCameras.indexOf(rayCamera), 1);
    }
}

export { Simulation };