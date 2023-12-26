"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { Simulation } from '../../simulation-engine/version-03/simulation.js';
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

const simulation = new Simulation(simParams);

let topLeft = simulation.world.createLinearState(new Vector2(-500, -400), 0.0);
let topRight = simulation.world.createLinearState(new Vector2(500, -400), 0.0);
let bottomRight = simulation.world.createLinearState(new Vector2(500, 400), 0.0);
let bottomLeft = simulation.world.createLinearState(new Vector2(-500, 400), 0.0);

let top = simulation.world.createLinearSpring(topLeft, topRight, 0.5, 0.5, 0.5);
let right = simulation.world.createLinearSpring(topRight, bottomRight, 0.5, 0.5, 0.5);
let bottom = simulation.world.createLinearSpring(bottomRight, bottomLeft, 0.5, 0.5, 0.5);
let left = simulation.world.createLinearSpring(bottomLeft, topLeft, 0.5, 0.5, 0.5);

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
let ray0 = simulation.createRay(new Vector2(-400, -100), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray1 = simulation.createRay(new Vector2(-400, -110), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray2 = simulation.createRay(new Vector2(-400, -120), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray3 = simulation.createRay(new Vector2(-400, -130), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray4 = simulation.createRay(new Vector2(-400, -140), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray5 = simulation.createRay(new Vector2(-400, -150), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray6 = simulation.createRay(new Vector2(-400, -160), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray7 = simulation.createRay(new Vector2(-400, -170), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray8 = simulation.createRay(new Vector2(-400, -180), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));
let ray9 = simulation.createRay(new Vector2(-400, -190), new Vector2(Math.cos(Math.PI * 2 * 0.05), Math.sin(Math.PI * 2 * 0.05)));

// let rayCaster1 = simulation.createRayCamera(new Vector2(-450, -350), new Vector2(Math.cos(Math.PI * 2 * 0.125), Math.sin(Math.PI * 2 * 0.125)), 16, Math.PI * 2 * 0.25);
// let rayCaster2 = simulation.createRayCamera(new Vector2(450, -350), new Vector2(Math.cos(Math.PI * 2 * 0.35), Math.sin(Math.PI * 2 * 0.35)), 32, Math.PI * 2 * 0.05);
// let rayCaster3 = simulation.createRayCamera(new Vector2(0, 0), new Vector2(Math.cos(Math.PI * 2 * 0.35), Math.sin(Math.PI * 2 * 0.35)), 64, Math.PI * 2 * 1);

let rayCaster1 = simulation.createRayCamera(new Vector2(-450, -350), Math.PI * 2 * 0.125, 16, Math.PI * 2 * 0.25);
let rayCaster2 = simulation.createRayCamera(new Vector2(450, -350), Math.PI * 2 * 0.35, 32, Math.PI * 2 * 0.05);
let rayCaster3 = simulation.createRayCamera(new Vector2(0, 0), Math.PI * 2 * 0.35, 64, Math.PI * 2 * 1);

//rayCaster1.castAll(simulation.world.linearSprings);
// console.log(rayCaster1);

// Run simulation
setInterval(update, 1000 / 60);  // Physics
window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

//console.log(simulation.world.linearSprings);

function update() {
    //simulation.rays.forEach(ray => {ray.castAll(simulation.world.linearSprings)});
    simulation.world.update();
    //ray0.origin = simulation.world.linearStates[1].position;
    //ray0.direction = simulation.world.linearSprings[0].angleVector;
    simulation.rays.forEach(ray => {ray.castAll(simulation.world.linearSprings)});
    simulation.rayCameras.forEach(rayCamera => { rayCamera.castAll(simulation.world.linearSprings) });
    simulation.rayCameras.forEach(rayCamera => { rayCamera.update() });
}