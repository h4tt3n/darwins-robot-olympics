"use strict";

// THe purpose of this code is to test physics engine collision detection and resolution.

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SimulationEngine } from '../../simulation-engine/version-04/simulationEngine.js';
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Collision } from '../../physics-engine/version-01/collision.js';

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

let topLeft = simulation.world.createPoint(new Vector2(-500, -400));
let topRight = simulation.world.createPoint(new Vector2(500, -400));
let bottomRight = simulation.world.createPoint(new Vector2(500, 300));
let bottomLeft = simulation.world.createPoint(new Vector2(-500, 300));
let bottomCenter = simulation.world.createPoint(new Vector2(0, 400));

let top = simulation.world.createLineSegment(topLeft, topRight);
let right = simulation.world.createLineSegment(topRight, bottomRight);
let bottom1 = simulation.world.createLineSegment(bottomRight, bottomCenter);
let bottom2 = simulation.world.createLineSegment(bottomCenter, bottomLeft);
let left = simulation.world.createLineSegment(bottomLeft, topLeft);

let linearState1 = simulation.world.createLinearState(new Vector2(-150, 0), 0.0);
let linearState2 = simulation.world.createParticle(new Vector2(-250, -100), 1.0, 4.0, "rgb(255, 0, 0)");
let linearState3 = simulation.world.createParticle(new Vector2(100, 100), 1.0, 4.0, "rgb(255, 0, 0)");

//linearState2.addImpulse(new Vector2(200, 0));

//let linearSpring1 = simulation.world.createLinearSpring(linearState1, linearState2, 0.5, 0.5, 0.5);
let linearSpring2 = simulation.world.createLinearSpring(linearState2, linearState3, 0.5, 0.5, 0.5);

//let angularSpring1 = simulation.world.createAngularSpring(linearSpring1, linearSpring2, 0.5, 0.5, 0.5);

let particle1 = simulation.world.createParticle(new Vector2(150, 0), 0.0, 4.0, "rgb(255, 0, 0)");
let particle2 = simulation.world.createParticle(new Vector2(300, -250), 10.0, 10.0, "rgb(255, 0, 0)");
let particle3 = simulation.world.createParticle(new Vector2(150, -150), 1000.0, 100.0, "rgb(255, 0, 0)");

particle3.addImpulse(new Vector2(-100, 0));

let linearSpring3 = simulation.world.createLinearSpring(particle1, particle2, 0.5, 0.5, 0.5);
let linearSpring4 = simulation.world.createLinearSpring(particle2, particle3, 0.5, 0.5, 0.5);
//linearSpring4.radius = 100;

//let angularSpring2 = simulation.world.createAngularSpring(linearSpring3, linearSpring4, 0.5, 0.5, 0.5);

let angularState1 = simulation.world.createAngularState(new Vector2(0, 0), 1.0, Math.PI * 2 * 0.0, 4000.0, );

angularState1.addAngularImpulse(0.5);
//angularState1.applyImpulseAtPoint(new Vector2(0, -10), new Vector2(50, 0));

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