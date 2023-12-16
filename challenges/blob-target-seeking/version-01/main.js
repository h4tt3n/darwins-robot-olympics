"use strict";

import { Vector2 } from '../../../vector-library/version-01/vector2.js';
import { SquishyPlanet } from '../../../physics-engine/version-01/squishyPlanet.js';
import { Network, ActivationFunctions } from "../../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, GeneticOperators, Individual } from "../../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from '../../../simulation-engine/version-01/renderer.js';
import { Blob } from '../../../entities/blob/target-seeking-version-01/blob.js';

// Neural network parameters
let nnParams = {
	layers : [4, 8, 2], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

// Genetic algorithm parameters
let gaParams = {

    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.

    // Genetic operators
    // Select individuals for mating.
    selection : {
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 4,
        },
    }, 
    // Mate individuals.
    crossover : {
        func : GeneticOperators.wholeArithmeticRecombination, //GeneticOperators.uniformCrossover,
        params : {
            numChildren : 1,
        },
    }, 
    // Mutate individuals.
    mutation : {
        func : GeneticOperators.randomizeMutation,
        params : {
            mutationChance : 0.01, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

const world = new SquishyPlanet.World();
const renderer = new Renderer('canvas', world);
const geneticAlgorithm = new GeneticAlgorithm(gaParams);

let blobs = [];
let deadBlobs = [];
let generation = 0;
let generationTicks = 0;

let randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
let target = world.createParticle(randomPosition, 0, 20, "rgb(255, 0, 0)");

console.log(target);

for(let i = 0; i < 1000; i++){
    let brain = new Network(null, nnParams);
    let randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
    let randomRadius = 2.0 + Math.random() * 8;
    let randomMass = 0.1 + Math.random() * 0.9;
    let randomColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ")";
    let body = world.createParticle(randomPosition, randomMass, randomRadius, randomColor);
    blobs.push(new Blob(brain, body));
}

console.log(blobs);

function update() {
    
    renderer.draw();

    blobs.forEach(b => { b.seekTarget(target)});

    world.update();

    evaluate();

    requestAnimationFrame(update);
}

function evaluate() {
    for (let i = blobs.length - 1; i >= 0; i--) {
        if (blobs[i].timeouts(500) || blobs[i].tooFarAwayFromTarget(target, 1000) || blobs[i].hitsTarget(target)) {
            blobs[i].calculateFitness(target);
            world.deleteParticle(blobs[i].body);
            deadBlobs.push(blobs.splice(i, 1)[0]);
        } else {
            blobs[i].ticksAlive++;
        }
    }

    if (blobs.length === 0) {
        
        let deadIndividuals = [];

        for (let i = 0; i < deadBlobs.length; i++) {
            let genome = deadBlobs[i].brain.encode();
            let fitness = deadBlobs[i].fitness;
            let individual = new Individual(genome, fitness);
            deadIndividuals.push(individual);
        }

        let newIndividuals = geneticAlgorithm.step(deadIndividuals);

        for (let i = 0; i < newIndividuals.length; i++) {
            let brain = new Network(null, nnParams);
            let randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
            let randomRadius = 2.0 + Math.random() * 8;
            let randomMass = 0.1 + Math.random() * 0.9;
            let randomColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ")";
            let body = world.createParticle(randomPosition, randomMass, randomRadius, randomColor);
            let blob = new Blob(brain, body);
            blob.brain.decode(newIndividuals[i].genome);
            blobs.push(blob);
        }
        
        deadBlobs = [];

        world.deleteParticle(target);
        randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
        target = world.createParticle(randomPosition, 0, 20, "rgb(255, 0, 0)");

        generationTicks = 0;
        generation++;
    }
}

update();