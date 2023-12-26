"use strict";

// THe purpose of this code is to test physics engine collision detection and resolution.

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SimulationEngine } from '../../simulation-engine/version-04/simulationEngine.js';
import { Collision } from '../../physics-engine/version-01/collision.js';
import { ActivationFunctions } from "../../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../../genetic-algorithm-engine/version-01/genetic-algorithm.js";

// Genetic algorithm parameters
// const gaParams = {
//     gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
//     elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.
//     selection : { // Select individuals for mating.
//         func : GeneticOperators.randomWayTournamentSelection,
//         params : {
//             numParents : 2,
//             maxContestants : 4,
//         },
//     }, 
//     crossover : { // Mate individuals.
//         func : GeneticOperators.wholeArithmeticRecombination,
//         params : {
//             numChildren : 1,
//         },
//     }, 
//     mutation : { // Mutate individuals.
//         func : GeneticOperators.randomizeMutation,
//         params : {
//             mutationChance : 0.01, 
//             minValue : 0, 
//             maxValue : 1
//         },
//     },
// };

// // Simulation parameters
// const simParams = {
//     gaParams : gaParams,
// }

const simulation = new SimulationEngine.Simulation();

let topLeft = simulation.world.createPoint(new Vector2(-600, -400));
let topRight = simulation.world.createPoint(new Vector2(600, -400));
let bottomRight = simulation.world.createPoint(new Vector2(600, 400));
let bottomLeft = simulation.world.createPoint(new Vector2(-600, 400));
let bottomCenter = simulation.world.createPoint(new Vector2(0, 350));

let top = simulation.world.createLineSegment(topLeft, topRight);
let right = simulation.world.createLineSegment(topRight, bottomRight);
let bottom1 = simulation.world.createLineSegment(bottomRight, bottomCenter);
let bottom2 = simulation.world.createLineSegment(bottomCenter, bottomLeft);
//let bottom = simulation.world.createLineSegment(bottomRight, bottomLeft);
let left = simulation.world.createLineSegment(bottomLeft, topLeft);

const nnParams = {
	layers : [7, 24, 10], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

// RoboWorm


// Spawn particles with random radius, mass, and color
// for (let i = 0; i < 2; i++) {
//     let position = new Vector2(Math.random() * 100 - 100, Math.random() * 100 - 100);
//     let particle = simulation.world.createParticle(position, Math.random() * 10, 20 + Math.random() * 50, "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")");
//     //particle.addImpulse(new Vector2(Math.random() * 1000, Math.random() * 1000));
// }


for (let i = 0; i < 100; i++) {
    let randomPosition = new Vector2(Math.random() * 300 - 300, Math.random() * 300 - 300)
    let robWormParams = {
        body : {
            position : randomPosition, //new Vector2(-300, -350),
            numSegments : 10,
            radius : 14,
            mass : 2,
            color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
        },
        brain : {
            genome : null,
            params : nnParams,
        },
        eyes : {
            position : randomPosition, //
            direction : Math.PI * 2 * 0,
            numRays : 7,
            fov : Math.PI * 2 * 0.25,
        }
    }


    let roboWorm = simulation.createRobWorm(robWormParams);
}



// botCrab
let position = new Vector2(100, -200);

//var particle1 = simulation.world.createParticle(new Vector2(300, -300), 100000, 50, "rgb(255, 192, 96)");

// Body
//var body = simulation.world.createLinearState(position, 0);
// var body = simulation.world.createParticle(position, 40, 40, "rgb(255, 192, 96)");

// //body.addImpulse(new Vector2(5000, 0));

// var leftLegAnchor = simulation.world.createParticle(position.add(new Vector2(-50, 15)), 20, 10, "rgb(255, 64, 64)");
// var rightLegAnchor = simulation.world.createParticle(position.add(new Vector2(50, 15)), 20, 10, "rgb(255, 64, 64)");

// // Leg anchors
// var leftLegLinear = simulation.world.createLinearSpring(body, leftLegAnchor, 1.0, 1.0, 1.0);
// var rightLegLinear = simulation.world.createLinearSpring(body, rightLegAnchor, 1.0, 1.0, 1.0);

// var legAngular = simulation.world.createAngularSpring(leftLegLinear, rightLegLinear, 1.0, 1.0, 1.0)

// // Articulated legs

// // Left leg 1
// //var leftLeg1Joint1 = simulation.world.createLinearState(leftLegAnchor.position.add(new Vector2(-30, -50)), 1.0);
// var leftLeg1Joint1 = simulation.world.createParticle(leftLegAnchor.position.add(new Vector2(-30, -50)), 16, 16, "rgb(255, 64, 64)");
// var leftLeg1Joint2 = simulation.world.createParticle(leftLeg1Joint1.position.add(new Vector2(-60, 20)), 12, 12, "rgb(255, 64, 64)");
// var leftLeg1Foot = simulation.world.createParticle(leftLeg1Joint2.position.add(new Vector2(-20, 100)), 8, 8, "rgb(255, 64, 64)");

// var leftLeg1Section1 = simulation.world.createLinearSpring(leftLegAnchor, leftLeg1Joint1, 1.0, 1.0, 1.0);
// var leftLeg1Section2 = simulation.world.createLinearSpring(leftLeg1Joint1, leftLeg1Joint2, 1.0, 1.0, 1.0);
// var leftLeg1Section3 = simulation.world.createLinearSpring(leftLeg1Joint2, leftLeg1Foot, 1.0, 1.0, 1.0);

// var leftLeg1Angular1 = simulation.world.createAngularSpring(leftLegLinear, leftLeg1Section1, 1.0, 1.0, 1.0);
// var leftLeg1Angular2 = simulation.world.createAngularSpring(leftLeg1Section1, leftLeg1Section2, 1.0, 1.0, 1.0);
// var leftLeg1Angular3 = simulation.world.createAngularSpring(leftLeg1Section2, leftLeg1Section3, 1.0, 1.0, 1.0);

// // Left leg 2
// var leftLeg2Joint1 = simulation.world.createParticle(leftLegAnchor.position.add(new Vector2(-30, -50)), 10, 3, "rgb(255, 64, 64)");
// var leftLeg2Joint2 = simulation.world.createParticle(leftLeg2Joint1.position.add(new Vector2(-60, 20)), 10, 3, "rgb(255, 64, 64)");
// var leftLeg2Foot = simulation.world.createParticle(leftLeg2Joint2.position.add(new Vector2(-20, 100)), 10.0, 5, "rgb(255, 64, 64)");

// var leftLeg2Section1 = simulation.world.createLinearSpring(leftLegAnchor, leftLeg2Joint1, 1.0, 1.0, 1.0);
// var leftLeg2Section2 = simulation.world.createLinearSpring(leftLeg2Joint1, leftLeg2Joint2, 1.0, 1.0, 1.0);
// var leftLeg2Section3 = simulation.world.createLinearSpring(leftLeg2Joint2, leftLeg2Foot, 1.0, 1.0, 1.0);

// var leftLeg2Angular1 = simulation.world.createAngularSpring(leftLegLinear, leftLeg2Section1, 1.0, 1.0, 1.0);
// var leftLeg2Angular2 = simulation.world.createAngularSpring(leftLeg2Section1, leftLeg2Section2, 1.0, 1.0, 1.0);
// var leftLeg2Angular3 = simulation.world.createAngularSpring(leftLeg2Section2, leftLeg2Section3, 1.0, 1.0, 1.0);

// // Right leg 1
// var rightLeg1Joint1 = simulation.world.createParticle(rightLegAnchor.position.add(new Vector2(30, -50)), 10, 3, "rgb(255, 64, 64)");
// var rightLeg1Joint2 = simulation.world.createParticle(rightLeg1Joint1.position.add(new Vector2(60, 20)), 10, 3, "rgb(255, 64, 64)");
// var rightLeg1Foot = simulation.world.createParticle(rightLeg1Joint2.position.add(new Vector2(20, 100)), 10.0, 5, "rgb(255, 64, 64)");

// var rightLeg1Section1 = simulation.world.createLinearSpring(rightLegAnchor, rightLeg1Joint1, 1.0, 1.0, 1.0);
// var rightLeg1Section2 = simulation.world.createLinearSpring(rightLeg1Joint1, rightLeg1Joint2, 1.0, 1.0, 1.0);
// var rightLeg1Section3 = simulation.world.createLinearSpring(rightLeg1Joint2, rightLeg1Foot, 1.0, 1.0, 1.0);

// var rightLeg1Angular1 = simulation.world.createAngularSpring(rightLegLinear, rightLeg1Section1, 1.0, 1.0, 1.0);
// var rightLeg1Angular2 = simulation.world.createAngularSpring(rightLeg1Section1, rightLeg1Section2, 1.0, 1.0, 1.0);
// var rightLeg1Angular3 = simulation.world.createAngularSpring(rightLeg1Section2, rightLeg1Section3, 1.0, 1.0, 1.0);

// // Right leg 2
// var rightLeg2Joint1 = simulation.world.createParticle(rightLegAnchor.position.add(new Vector2(30, -50)), 10, 3, "rgb(255, 64, 64)");
// var rightLeg2Joint2 = simulation.world.createParticle(rightLeg2Joint1.position.add(new Vector2(60, 20)), 10, 3, "rgb(255, 64, 64)");
// var rightLeg2Foot = simulation.world.createParticle(rightLeg2Joint2.position.add(new Vector2(20, 100)), 10.0, 5, "rgb(255, 64, 64)");

// var rightLeg2Section1 = simulation.world.createLinearSpring(rightLegAnchor, rightLeg2Joint1, 1.0, 1.0, 1.0);
// var rightLeg2Section2 = simulation.world.createLinearSpring(rightLeg2Joint1, rightLeg2Joint2, 1.0, 1.0, 1.0);
// var rightLeg2Section3 = simulation.world.createLinearSpring(rightLeg2Joint2, rightLeg2Foot, 1.0, 1.0, 1.0);

// var rightLeg2Angular1 = simulation.world.createAngularSpring(rightLegLinear, rightLeg2Section1, 1.0, 1.0, 1.0);
// var rightLeg2Angular2 = simulation.world.createAngularSpring(rightLeg2Section1, rightLeg2Section2, 1.0, 1.0, 1.0);
// var rightLeg2Angular3 = simulation.world.createAngularSpring(rightLeg2Section2, rightLeg2Section3, 1.0, 1.0, 1.0);

// leftLeg2Angular1.setRestAngleVector(0.1 * Math.PI * 2.0);
// rightLeg2Angular1.setRestAngleVector(-0.1 * Math.PI * 2.0);


// Run simulation
//setInterval(update, 1000/60);  // Physics
setInterval(update, 0);  // Physics
window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.update();
}