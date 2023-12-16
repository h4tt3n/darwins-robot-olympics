"use strict";


import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Network } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, Individual } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from './renderer.js';
import { Ray, RayCamera } from './rayCaster.js';
import { WayPoint } from './wayPoint.js';
import { RoboBlob } from './roboBlob.js';
import { RoboCar } from './roboCar.js';
import { RoboCrab } from './roboCrab.js';
import { RoboDog } from './roboDog.js';
import { RoboRocket } from './roboRocket.js';
import { RoboWorm } from './roboWorm.js';

class Simulation {
    constructor(params = {}) {
        this.gaParams = params.gaParams;

        this.world = new SquishyPlanet.World();
        this.renderer = new Renderer('canvas', this);
        this.geneticAlgorithm = new GeneticAlgorithm(params.gaParams);

        // Render, UI and mouse / keyboard control
        this.renderRaycasts = false;
        this.followSelectedCreature = false;
        this.selectedCreature = null;

        // Basic business logic
        this.isInitiated = false;

        this.isPaused = false;

        this.robotCreationFunc = {
            func : null,
            params : null,
        };

        this.robotArrayRef = null;
        this.deadRobotArrayRef = null;

        this.rays = [];
        this.rayCameras = [];

        this.neuralNetworks = [];

        this.wayPoints = [];

        //
        this.individuals = [];
        this.deadIndividuals = [];

        this.roboBlobs = [];
        this.deadRoboBlobs = [];

        this.roboCrabs = [];
        this.deadRoboCrabs = [];

        this.roboDogs = [];
        this.deadRoboDogs = [];

        this.roboWorms = [];
        this.deadRoboWorms = [];

        this.generation = 0;
        this.generationTicks = 0;
        this.generationsMaxTicks = 1000;
    }
    update() {
        // Physics
        this.world.update();

        // Robot brains
        this.roboBlobs.forEach(blob => { blob.update(); });
        this.roboCrabs.forEach(crab => { crab.update(); });
        this.roboDogs.forEach(dog => { dog.update(); });
        this.roboWorms.forEach(worm => { worm.update(); });

        let raycastableSegments = this.world.lineSegments; //.concat(this.world.linearSprings);

        this.rayCameras.forEach(rayCamera => { rayCamera.castAll(raycastableSegments) });
        this.rayCameras.forEach(rayCamera => { rayCamera.update() });
    }
    evaluate() {
    
        // Check if robot has completed challenge, using challenge-specific functions
        for (let i = 0; i < this.roboWorms.length; i++) {
            
            let worm = this.roboWorms[i];
            
            if (creatureTimeouts(worm, 1000) || hasReachedTarget(worm, target)) {
                calculateFitness(worm, target);
                console.log("fitness " + worm.fitness);
                this.deleteRoboWorm(worm);
            } else {
                worm.ticksAlive++;
            }
        }
    
        // When all robots are disabled, create new generation
        if (this.roboWorms.length === 0) {
            
            // Run genetic algorithm
            this.runGeneticAlgorithm();
            
            // Create new robots
            this.robotSpawner.func(this.robotSpawner.numRobots, this.robotSpawner.robotParams, this.individuals);
            
            // Reset simulation
            this.deadRoboWorms = [];
            this.world.collisions = new Map();
            this.generationTicks = 0;
            this.generation++;
        }
    }
    runGeneticAlgorithm() {
        // Clear old individuals
        this.deadIndividuals = [];

        // Create genetic algorithm individuals from disabled robots
        for (let i = 0; i < this.deadRoboWorms.length; i++) {
            let individualParams = {
                genome : this.deadRoboWorms[i].brain.encode(),
                fitness : this.deadRoboWorms[i].fitness,
            }
            this.createIndividual(individualParams);
        }

        // Run genetic algorithm
        this.individuals = this.geneticAlgorithm.step(this.deadIndividuals);
    }
    deleteRobot(robot) {
        // Delete brain
        this.deleteNeuralNetwork(robot.brain);
        // Delete senses
        this.deleteRayCamera(robot.eyes);
        // Delete body
        for (let i = 0; i < robot.body.angularSprings.length; i++) {
            this.world.deleteAngularSpring(robot.body.angularSprings[i]);
        }
        for (let i = 0; i < robot.body.linearSprings.length; i++) {
            this.world.deleteLinearSpring(robot.body.linearSprings[i]);
        }
        for (let i = 0; i < robot.body.particles.length; i++) {
            this.world.deleteParticle(robot.body.particles[i]);
        }
        this.robotArrayRef.splice(this.robotArrayRef.indexOf(robot), 1);
        this.deadRobotArrayRef.push(robot);
    }
    createWaypoint(position, radius, color) {
        let wayPoint = new WayPoint(position, radius, color);
        this.wayPoints.push(wayPoint);
        return wayPoint;
    }
    deleteWaypoint(wayPoint) {
        this.wayPoints.splice(this.wayPoints.indexOf(wayPoint), 1);
    }
    createRoboCrab(params = {}) {

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

        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let crab = new RoboCrab(brain, bodyParts, eyes);
        //this.roboCrabs.push(crab);
        this.roboWorms.push(crab); // Wrong, for testing
        return crab;
    }
    deleteRoboCrab(crab) {
        //this.world.deleteParticle(worm.body);
        this.deleteNeuralNetwork(crab.brain);
        this.deleteRayCamera(crab.eyes);
        // Delete body
        //console.log(crab.body)
        for (let i = 0; i < crab.body.angularSprings.length; i++) {
            this.world.deleteAngularSpring(crab.body.angularSprings[i]);
        }
        for (let i = 0; i < crab.body.linearSprings.length; i++) {
            this.world.deleteLinearSpring(crab.body.linearSprings[i]);
        }
        for (let i = 0; i < crab.body.particles.length; i++) {
            this.world.deleteParticle(crab.body.particles[i]);
        }
        // this.roboCrabs.splice(this.roboCrabs.indexOf(crab), 1);
        // this.deadRoboCrabs.push(crab);
        this.roboWorms.splice(this.roboWorms.indexOf(crab), 1); // Wrong, for testing
        this.deadRoboWorms.push(crab); // Wrong, for testing
    }

    createRobWorm(params = {}) {
        let body = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
        }
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        
        for (let i = 0; i < params.body.numSegments; i++) {
            //let particle = this.world.createParticle(params.body.position, params.body.mass, params.body.radius, params.body.color);
            let particle = this.world.createParticle(params.body.position, params.body.mass, params.body.radius, randomColor);
            params.body.position = params.body.position.sub(new Vector2(params.body.radius * 2.2, 0));
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
            //angularSpring.setRestAngleVector(Math.random() * Math.PI * 1 - Math.PI * 1);
            body.angularSprings.push(angularSpring);
        }
        
        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let worm = new RoboWorm(brain, body, eyes);
        this.roboWorms.push(worm);
        return worm;
    }
    deleteRoboWorm(worm) {
        //this.world.deleteParticle(worm.body);
        this.deleteNeuralNetwork(worm.brain);
        this.deleteRayCamera(worm.eyes);
        // Delete body
        for (let i = 0; i < worm.body.angularSprings.length; i++) {
            this.world.deleteAngularSpring(worm.body.angularSprings[i]);
        }
        for (let i = 0; i < worm.body.linearSprings.length; i++) {
            this.world.deleteLinearSpring(worm.body.linearSprings[i]);
        }
        for (let i = 0; i < worm.body.particles.length; i++) {
            this.world.deleteParticle(worm.body.particles[i]);
        }
        this.roboWorms.splice(this.roboWorms.indexOf(worm), 1);
        this.deadRoboWorms.push(worm);
    }
    createRoboBlob(params = {}) {
        let body = this.world.createParticle(params.body.position, params.body.mass, params.body.radius, params.body.color);
        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let blob = new RoboBlob(brain, body, eyes);
        this.roboBlobs.push(blob);
        return blob;
    }
    deleteRoboBlob(blob) {
        this.world.deleteParticle(blob.body);
        this.deleteNeuralNetwork(blob.brain);
        this.deleteRayCamera(blob.eyes);
        this.roboBlobs.splice(this.roboBlobs.indexOf(blob), 1);
        this.deadRoboBlobs.push(blob);
    }
    createIndividual(params = {}) {
        let individual = new Individual(params.genome, params.fitness);
        this.deadIndividuals.push(individual);
        return individual;
    }
    deleteIndividual(individual) {
        this.individuals.splice(this.individuals.indexOf(individual), 1);
        this.deadIndividuals.push(individual);
    }
    createNeuralNetwork(genome, params) {
        let neuralNetwork = new Network(genome, params);
        this.neuralNetworks.push(neuralNetwork);
        return neuralNetwork;
    }
    deleteNeuralNetwork(neuralNetwork) {
        this.neuralNetworks.splice(this.neuralNetworks.indexOf(neuralNetwork), 1);
    }
    createRay(origin, direction) {
        let ray = new Ray(origin, direction);
        this.rays.push(ray);
        return ray;
    }
    deleteRay(ray) {
        this.rays.splice(this.rays.indexOf(ray), 1);
    }
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