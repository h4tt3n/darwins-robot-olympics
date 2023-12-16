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
import { RoboStarfish } from './roboStarfish.js';
import { RoboGuy } from './roboGuy.js';

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
        this.generation = 0;
        this.generationTicks = 0;
        this.generationsMaxTicks = 1000;
        this.setIntervalId = null;

        this.robotCreationFunc = {
            func : null,
            params : null,
        };

        this.robotSpawner = {
            func : null,
            params : null,
        };

        this.challengeSpawner = {
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

        this.roboCrabs = [];
        this.deadRoboCrabs = [];

        this.roboWorms = [];
        this.deadRoboWorms = [];

        this.roboStarfishes = [];
        this.deadRoboStarfishes = [];
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
        this.generationsMaxTicks = 1000;
        this.setIntervalId = null;

        this.robotCreationFunc = {
            func : null,
            params : null,
        };

        this.robotArrayRef = null;
        this.deadRobotArrayRef = null;

        //
        this.robotArrayRef = null;
        this.deadRobotArrayRef = null;

        this.rays = [];
        this.rayCameras = [];
        this.neuralNetworks = [];
        this.wayPoints = [];

        this.individuals = [];
        this.deadIndividuals = [];

        this.roboCrabs = [];
        this.deadRoboCrabs = [];

        this.roboWorms = [];
        this.deadRoboWorms = [];

        this.roboStarfishes = [];
        this.deadRoboStarfishes = [];
    }
    update() {
        // Physics
        this.world.update();

        // Robot brains
        this.roboCrabs.forEach(crab => { crab.update(); });
        this.roboWorms.forEach(worm => { worm.update(); });
        //this.roboStarfishes.forEach(starfish => { starfish.update(); });

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
    createRoboGuy(params = {}) {
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
        var neckAngular = this.world.createAngularSpring(neckLinear, upperTorsoLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(neckAngular);

        // Torso angular
        var torsoAngular = this.world.createAngularSpring(upperTorsoLinear, lowerTorsoLinear, 0.25, 0.5, 0.5);
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
        var leftUpperArmAngular = this.world.createAngularSpring(upperTorsoLinear, leftUpperArmLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(leftUpperArmAngular);
        bodyParts.leftUpperArmAngular = leftUpperArmAngular;

        // Left lower arm angular
        var leftLowerArmAngular = this.world.createAngularSpring(leftUpperArmLinear, leftLowerArmLinear, 0.25, 0.5, 0.5);
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
        var rightUpperArmAngular = this.world.createAngularSpring(upperTorsoLinear, rightUpperArmLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(rightUpperArmAngular);
        bodyParts.rightUpperArmAngular = rightUpperArmAngular;

        // Right lower arm angular
        var rightLowerArmAngular = this.world.createAngularSpring(rightUpperArmLinear, rightLowerArmLinear, 0.25, 0.5, 0.5);
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
        var leftUpperLegAngular = this.world.createAngularSpring(lowerTorsoLinear, leftUpperLegLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(leftUpperLegAngular);
        bodyParts.leftUpperLegAngular = leftUpperLegAngular;

        // Left lower leg angular
        var leftLowerLegAngular = this.world.createAngularSpring(leftUpperLegLinear, leftLowerLegLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(leftLowerLegAngular);
        bodyParts.leftLowerLegAngular = leftLowerLegAngular;

        // Left heel angular
        var leftHeelAngular = this.world.createAngularSpring(leftLowerLegLinear, leftHeelLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(leftHeelAngular);

        // Left sole angular
        var leftSoleAngular = this.world.createAngularSpring(leftHeelLinear, leftSoleLinear, 0.25, 0.5, 0.5);
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
        var rightUpperLegAngular = this.world.createAngularSpring(lowerTorsoLinear, rightUpperLegLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(rightUpperLegAngular);
        bodyParts.rightUpperLegAngular = rightUpperLegAngular;

        // Right lower leg angular
        var rightLowerLegAngular = this.world.createAngularSpring(rightUpperLegLinear, rightLowerLegLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(rightLowerLegAngular);
        bodyParts.rightLowerLegAngular = rightLowerLegAngular;

        // Right heel angular
        var rightHeelAngular = this.world.createAngularSpring(rightLowerLegLinear, rightHeelLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(rightHeelAngular);

        // Right sole angular
        var rightSoleAngular = this.world.createAngularSpring(rightHeelLinear, rightSoleLinear, 0.25, 0.5, 0.5);
        bodyParts.angularSprings.push(rightSoleAngular);

        // Create brain
        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let guy = new RoboGuy(brain, bodyParts, eyes);
        this.roboWorms.push(guy); // Wrong, for testing
        return guy;
    }
    deleteRoboGuy(guy) {
        //this.world.deleteParticle(worm.body);
        this.deleteNeuralNetwork(guy.brain);
        this.deleteRayCamera(guy.eyes);
        // Delete body
        //console.log(crab.body)
        for (let i = 0; i < guy.body.angularSprings.length; i++) {
            this.world.deleteAngularSpring(guy.body.angularSprings[i]);
        }
        for (let i = 0; i < guy.body.linearSprings.length; i++) {
            this.world.deleteLinearSpring(guy.body.linearSprings[i]);
        }
        for (let i = 0; i < guy.body.particles.length; i++) {
            this.world.deleteParticle(guy.body.particles[i]);
        }
        // this.roboCrabs.splice(this.roboCrabs.indexOf(crab), 1);
        // this.deadRoboCrabs.push(crab);
        this.roboWorms.splice(this.roboWorms.indexOf(guy), 1); // Wrong, for testing
        this.deadRoboWorms.push(guy); // Wrong, for testing
    }
    createRoboStarfish(params = {}) {
        let bodyParts = {
            particles : [],
            linearSprings : [],
            angularSprings : [],
            leg1AngularSprings : [],
            leg2AngularSprings : [],
            leg3AngularSprings : [],
        }

        let position = new Vector2(200, 200); //new Vector2(0, 0);
        let legAncorRadius = 8
        let legSectionLength = 18;
        let legSectionRadius = 10;
        let legJointRadius = 8;
        let randomColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";
        let randomColor2 = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")";

        // Body
        var body = this.world.createParticle(position, 30, 25, randomColor);
        bodyParts.particles.push(body);

        let leg1Angle = Math.PI * 2 * 0.0;
        let leg2Angle = Math.PI * 2 * 1/3;
        let leg3Angle = Math.PI * 2 * 2/3;

        let leg1AngleVector = new Vector2(Math.cos(leg1Angle), Math.sin(leg1Angle));
        let leg2AngleVector = new Vector2(Math.cos(leg2Angle), Math.sin(leg2Angle));
        let leg3AngleVector = new Vector2(Math.cos(leg3Angle), Math.sin(leg3Angle));

        // Leg anchors
        var leg1Anchor = this.world.createParticle(position.add(leg1AngleVector.mul(body.radius + legAncorRadius)), legAncorRadius, legJointRadius, randomColor);
        var leg2Anchor = this.world.createParticle(position.add(leg2AngleVector.mul(body.radius + legAncorRadius)), legAncorRadius, legJointRadius, randomColor);
        var leg3Anchor = this.world.createParticle(position.add(leg3AngleVector.mul(body.radius + legAncorRadius)), legAncorRadius, legJointRadius, randomColor);

        bodyParts.particles.push(leg1Anchor);
        bodyParts.particles.push(leg2Anchor);
        bodyParts.particles.push(leg3Anchor);

        var leg1Linear = this.world.createLinearSpring(body, leg1Anchor, 1.0, 1.0, 1.0);
        var leg2Linear = this.world.createLinearSpring(body, leg2Anchor, 1.0, 1.0, 1.0);
        var leg3Linear = this.world.createLinearSpring(body, leg3Anchor, 1.0, 1.0, 1.0);

        leg1Linear.radius = legSectionRadius;
        leg2Linear.radius = legSectionRadius;
        leg3Linear.radius = legSectionRadius;

        leg1Linear.color = randomColor2;
        leg2Linear.color = randomColor2;
        leg3Linear.color = randomColor2;

        bodyParts.linearSprings.push(leg1Linear);
        bodyParts.linearSprings.push(leg2Linear);
        bodyParts.linearSprings.push(leg3Linear);

        var leg1Angular = this.world.createAngularSpring(leg1Linear, leg2Linear, 0.5, 0.5, 0.5);
        var leg2Angular = this.world.createAngularSpring(leg2Linear, leg3Linear, 0.5, 0.5, 0.5);
        var leg3Angular = this.world.createAngularSpring(leg3Linear, leg1Linear, 0.5, 0.5, 0.5);

        bodyParts.angularSprings.push(leg1Angular);
        bodyParts.angularSprings.push(leg2Angular);
        bodyParts.angularSprings.push(leg3Angular);

        // Leg 1
        var leg1Joint1 = this.world.createParticle(leg1Anchor.position.add(leg1AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg1Joint2 = this.world.createParticle(leg1Joint1.position.add(leg1AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg1Foot = this.world.createParticle(leg1Joint2.position.add(leg1AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);

        bodyParts.particles.push(leg1Joint1);
        bodyParts.particles.push(leg1Joint2);
        bodyParts.particles.push(leg1Foot);

        var leg1Section1 = this.world.createLinearSpring(leg1Anchor, leg1Joint1, 1.0, 1.0, 1.0);
        var leg1Section2 = this.world.createLinearSpring(leg1Joint1, leg1Joint2, 1.0, 1.0, 1.0);
        var leg1Section3 = this.world.createLinearSpring(leg1Joint2, leg1Foot, 1.0, 1.0, 1.0);

        leg1Section1.radius = legSectionRadius;
        leg1Section2.radius = legSectionRadius;
        leg1Section3.radius = legSectionRadius;

        leg1Section1.color = randomColor2;
        leg1Section2.color = randomColor2;
        leg1Section3.color = randomColor2;

        bodyParts.linearSprings.push(leg1Section1);
        bodyParts.linearSprings.push(leg1Section2);
        bodyParts.linearSprings.push(leg1Section3);

        var leg1Angular1 = this.world.createAngularSpring(leg1Linear, leg1Section1, 0.5, 0.5, 0.5);
        var leg1Angular2 = this.world.createAngularSpring(leg1Section1, leg1Section2, 0.25, 0.5, 0.5);
        var leg1Angular3 = this.world.createAngularSpring(leg1Section2, leg1Section3, 0.125, 0.5, 0.5);

        bodyParts.angularSprings.push(leg1Angular1);
        bodyParts.angularSprings.push(leg1Angular2);
        bodyParts.angularSprings.push(leg1Angular3);

        bodyParts.leg1AngularSprings.push(leg1Angular1);
        bodyParts.leg1AngularSprings.push(leg1Angular2);
        bodyParts.leg1AngularSprings.push(leg1Angular3);

        // Leg 2
        var leg2Joint1 = this.world.createParticle(leg2Anchor.position.add(leg2AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg2Joint2 = this.world.createParticle(leg2Joint1.position.add(leg2AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg2Foot = this.world.createParticle(leg2Joint2.position.add(leg2AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);

        bodyParts.particles.push(leg2Joint1);
        bodyParts.particles.push(leg2Joint2);
        bodyParts.particles.push(leg2Foot);

        var leg2Section1 = this.world.createLinearSpring(leg2Anchor, leg2Joint1, 1.0, 1.0, 1.0);
        var leg2Section2 = this.world.createLinearSpring(leg2Joint1, leg2Joint2, 1.0, 1.0, 1.0);
        var leg2Section3 = this.world.createLinearSpring(leg2Joint2, leg2Foot, 1.0, 1.0, 1.0);

        leg2Section1.radius = legSectionRadius;
        leg2Section2.radius = legSectionRadius;
        leg2Section3.radius = legSectionRadius;

        leg2Section1.color = randomColor2;
        leg2Section2.color = randomColor2;
        leg2Section3.color = randomColor2;

        bodyParts.linearSprings.push(leg2Section1);
        bodyParts.linearSprings.push(leg2Section2);
        bodyParts.linearSprings.push(leg2Section3);

        var leg2Angular1 = this.world.createAngularSpring(leg2Linear, leg2Section1, 0.5, 0.5, 0.5);
        var leg2Angular2 = this.world.createAngularSpring(leg2Section1, leg2Section2, 0.25, 0.5, 0.5);
        var leg2Angular3 = this.world.createAngularSpring(leg2Section2, leg2Section3, 0.125, 0.5, 0.5);

        bodyParts.angularSprings.push(leg2Angular1);
        bodyParts.angularSprings.push(leg2Angular2);
        bodyParts.angularSprings.push(leg2Angular3);
        
        bodyParts.leg2AngularSprings.push(leg2Angular1);
        bodyParts.leg2AngularSprings.push(leg2Angular2);
        bodyParts.leg2AngularSprings.push(leg2Angular3);

        // Leg 3
        var leg3Joint1 = this.world.createParticle(leg3Anchor.position.add(leg3AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg3Joint2 = this.world.createParticle(leg3Joint1.position.add(leg3AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);
        var leg3Foot = this.world.createParticle(leg3Joint2.position.add(leg3AngleVector.mul(legSectionLength)), 5, legJointRadius, randomColor);

        bodyParts.particles.push(leg3Joint1);
        bodyParts.particles.push(leg3Joint2);
        bodyParts.particles.push(leg3Foot);

        var leg3Section1 = this.world.createLinearSpring(leg3Anchor, leg3Joint1, 1.0, 1.0, 1.0);
        var leg3Section2 = this.world.createLinearSpring(leg3Joint1, leg3Joint2, 1.0, 1.0, 1.0);
        var leg3Section3 = this.world.createLinearSpring(leg3Joint2, leg3Foot, 1.0, 1.0, 1.0);

        leg3Section1.radius = legSectionRadius;
        leg3Section2.radius = legSectionRadius;
        leg3Section3.radius = legSectionRadius;

        leg3Section1.color = randomColor2;
        leg3Section2.color = randomColor2;
        leg3Section3.color = randomColor2;

        bodyParts.linearSprings.push(leg3Section1);
        bodyParts.linearSprings.push(leg3Section2);
        bodyParts.linearSprings.push(leg3Section3);

        var leg3Angular1 = this.world.createAngularSpring(leg3Linear, leg3Section1, 0.5, 0.5, 0.5);
        var leg3Angular2 = this.world.createAngularSpring(leg3Section1, leg3Section2, 0.25, 0.5, 0.5);
        var leg3Angular3 = this.world.createAngularSpring(leg3Section2, leg3Section3, 0.125, 0.5, 0.5);

        bodyParts.angularSprings.push(leg3Angular1);
        bodyParts.angularSprings.push(leg3Angular2);
        bodyParts.angularSprings.push(leg3Angular3);

        bodyParts.leg3AngularSprings.push(leg3Angular1);
        bodyParts.leg3AngularSprings.push(leg3Angular2);
        bodyParts.leg3AngularSprings.push(leg3Angular3);

        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let starfish = new RoboStarfish(brain, bodyParts, eyes);
        //this.roboCrabs.push(crab);
        this.roboWorms.push(starfish); // Wrong, for testing
        return starfish;
    }
    deleteRoboStarfish(starfish) {
        //this.world.deleteParticle(worm.body);
        this.deleteNeuralNetwork(starfish.brain);
        this.deleteRayCamera(starfish.eyes);
        // Delete body
        //console.log(crab.body)
        for (let i = 0; i < starfish.body.angularSprings.length; i++) {
            this.world.deleteAngularSpring(starfish.body.angularSprings[i]);
        }
        for (let i = 0; i < starfish.body.linearSprings.length; i++) {
            this.world.deleteLinearSpring(starfish.body.linearSprings[i]);
        }
        for (let i = 0; i < starfish.body.particles.length; i++) {
            this.world.deleteParticle(starfish.body.particles[i]);
        }
        // this.roboCrabs.splice(this.roboCrabs.indexOf(crab), 1);
        // this.deadRoboCrabs.push(crab);
        this.roboWorms.splice(this.roboWorms.indexOf(starfish), 1); // Wrong, for testing
        this.deadRoboWorms.push(starfish); // Wrong, for testing
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

        var leftLeg1Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg1Section1, 1.0, 1.0, 0.5);
        var leftLeg1Angular2 = this.world.createAngularSpring(leftLeg1Section1, leftLeg1Section2, 0.25, 1.0, 0.5);
        var leftLeg1Angular3 = this.world.createAngularSpring(leftLeg1Section2, leftLeg1Section3, 0.125, 1.0, 0.5);
        
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

        var leftLeg2Angular1 = this.world.createAngularSpring(leftLegLinear, leftLeg2Section1, 1.0, 1.0, 0.5);
        var leftLeg2Angular2 = this.world.createAngularSpring(leftLeg2Section1, leftLeg2Section2, 0.25, 1.0, 0.5);
        var leftLeg2Angular3 = this.world.createAngularSpring(leftLeg2Section2, leftLeg2Section3, 0.125, 1.0, 0.5);

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

        var rightLeg1Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg1Section1, 1.0, 1.0, 0.5);
        var rightLeg1Angular2 = this.world.createAngularSpring(rightLeg1Section1, rightLeg1Section2, 0.25, 1.0, 0.5);
        var rightLeg1Angular3 = this.world.createAngularSpring(rightLeg1Section2, rightLeg1Section3, 0.125, 1.0, 0.5);

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

        var rightLeg2Angular1 = this.world.createAngularSpring(rightLegLinear, rightLeg2Section1, 1.0, 1.0, 0.5);
        var rightLeg2Angular2 = this.world.createAngularSpring(rightLeg2Section1, rightLeg2Section2, 0.25, 1.0, 0.5);
        var rightLeg2Angular3 = this.world.createAngularSpring(rightLeg2Section2, rightLeg2Section3, 0.125, 1.0, 0.5);

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
        // Delete brain
        this.deleteNeuralNetwork(worm.brain);
        // Delete senses
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