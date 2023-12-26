"use strict";

// THe purpose of this code is to test SimulationEngine version 04.

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SimulationEngine } from '../../simulation-engine/version-04/simulationEngine.js';
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";

// Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 4,
        },
    }, 
    crossover : { // Mate individuals.
        func : GeneticOperators.wholeArithmeticRecombination,
        params : {
            numChildren : 1,
        },
    }, 
    mutation : { // Mutate individuals.
        func : GeneticOperators.randomizeMutation,
        params : {
            mutationChance : 0.01, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

const simulation = new SimulationEngine.Simulation(simParams);

let topLeft = simulation.world.createPoint(new Vector2(-500, -400));
let topRight = simulation.world.createPoint(new Vector2(500, -400));
let bottomRight = simulation.world.createPoint(new Vector2(500, 400));
let bottomLeft = simulation.world.createPoint(new Vector2(-500, 400));

let top = simulation.world.createLineSegment(topLeft, topRight);
let right = simulation.world.createLineSegment(topRight, bottomRight);
let bottom = simulation.world.createLineSegment(bottomRight, bottomLeft);
let left = simulation.world.createLineSegment(bottomLeft, topLeft);

let linearState1 = simulation.world.createLinearState(new Vector2(-150, 0), 0.0);
let linearState2 = simulation.world.createLinearState(new Vector2(-150, -150), 10.0);
let linearState3 = simulation.world.createLinearState(new Vector2(-150, -300), 1.0);

linearState2.addImpulse(new Vector2(200, 0));

let linearSpring1 = simulation.world.createLinearSpring(linearState1, linearState2, 0.5, 0.5, 0.5);
let linearSpring2 = simulation.world.createLinearSpring(linearState2, linearState3, 0.5, 0.5, 0.5);

//let angularSpring1 = simulation.world.createAngularSpring(linearSpring1, linearSpring2, 0.5, 0.5, 0.5);

let particle1 = simulation.world.createParticle(new Vector2(150, 0), 0.0, 4.0, "rgb(255, 0, 0)");
let particle2 = simulation.world.createParticle(new Vector2(150, -150), 1.0, 4.0, "rgb(255, 0, 0)");
let particle3 = simulation.world.createParticle(new Vector2(150, -300), 10.0, 8.0, "rgb(255, 0, 0)");

particle3.addImpulse(new Vector2(-200, 0));

let linearSpring3 = simulation.world.createLinearSpring(particle1, particle2, 0.5, 0.5, 0.5);
let linearSpring4 = simulation.world.createLinearSpring(particle2, particle3, 0.5, 0.5, 0.5);

//let angularSpring2 = simulation.world.createAngularSpring(linearSpring3, linearSpring4, 0.5, 0.5, 0.5);

// Raycasting
let ray0 = simulation.createRay(new Vector2(-400, -80), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray1 = simulation.createRay(new Vector2(-400, -100), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray2 = simulation.createRay(new Vector2(-400, -120), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray3 = simulation.createRay(new Vector2(-400, -140), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));

// let rayCaster1 = simulation.createRayCamera(new Vector2(-450, -350), new Vector2(Math.cos(Math.PI * 2 * 0.125), Math.sin(Math.PI * 2 * 0.125)), 16, Math.PI * 2 * 0.25);
// let rayCaster2 = simulation.createRayCamera(new Vector2(450, -350), new Vector2(Math.cos(Math.PI * 2 * 0.35), Math.sin(Math.PI * 2 * 0.35)), 15, Math.PI * 2 * 0.5);
// let rayCaster3 = simulation.createRayCamera(new Vector2(0, 0), new Vector2(Math.cos(Math.PI * 2 * 0.35), Math.sin(Math.PI * 2 * 0.35)), 64, Math.PI * 2 * 1);
let rayCaster1 = simulation.createRayCamera(new Vector2(-450, -350), Math.PI * 2 * 0.125, 16, Math.PI * 2 * 0.25);
let rayCaster2 = simulation.createRayCamera(new Vector2(450, -350), Math.PI * 2 * 0.35, 15, Math.PI * 2 * 0.5);
//let rayCaster3 = simulation.createRayCamera(new Vector2(0, 0), Math.PI * 2 * 0.35, 64, Math.PI * 2 * 1);

let angularState1 = simulation.world.createAngularState(new Vector2(0, 0), 1.0, Math.PI * 2 * 0.0, 4000.0, );

angularState1.addAngularImpulse(0.5);
//angularState1.applyImpulseAtPoint(new Vector2(0, -10), new Vector2(50, 0));

let raycastableSegments = simulation.world.linearSprings.concat(simulation.world.lineSegments);

// Run simulation
setInterval(update, 0);  // Physics
window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.update();
    rayCaster2.origin = angularState1.position;
    rayCaster2.directionVector = angularState1.angleVector;
    simulation.rays.forEach(ray => {ray.castAll(raycastableSegments)});
    simulation.rayCameras.forEach(rayCamera => { rayCamera.castAll(raycastableSegments) });
    simulation.rayCameras.forEach(rayCamera => { rayCamera.update() });
}