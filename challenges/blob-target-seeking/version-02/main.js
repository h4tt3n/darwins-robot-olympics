"use strict";

// This version implements the Simulation class as root and owner of the physics engine world, renderer, and genetic algorithm.
// The simulation uses renderer version 2 which takes simulation as a parameter.
// TODO:
// Use simulation createBlob and DeleteBlob. Ok.
// Use simulation createIndividual and deleteIndividual.


import { Vector2 } from '../../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Simulation } from '../../../simulation-engine/version-02/simulation.js';

// Neural network parameters
const nnParams = {
	layers : [4, 16, 2], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

// Genetic algorithm parameters
const gaParams = {

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

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

// Set up simulation world and entities
const simulation = new Simulation(simParams);

// Spawn target
let randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
let target = simulation.world.createParticle(randomPosition, 0, 20, "rgb(255, 0, 0)");

for(let i = 0; i < 1000; i++){

    let blobParams = {
        body : {
            position : new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800),
            mass : 0.1 + Math.random() * 0.9,
            radius : 2.0 + Math.random() * 8,
            color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
        },
        brain : {
            genome : null,
            params : nnParams,
        }
    }

    simulation.createBlob(blobParams);
}

// Run simulation
setInterval(update, 0);

window.requestAnimationFrame(render);

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.generationTicks++;
    simulation.blobs.forEach(b => { b.seekTarget(target)});
    simulation.world.update();
    evaluate();
}

function evaluate() {
    //
    for (let i = 0; i < simulation.blobs.length; i++) {
        if (simulation.blobs[i].timeouts(500) || simulation.blobs[i].tooFarAwayFromTarget(target, 1000) || simulation.blobs[i].hitsTarget(target)) {
            simulation.blobs[i].calculateFitness(target);
            simulation.deleteBlob(simulation.blobs[i]);
        } else {
            simulation.blobs[i].ticksAlive++;
        }
    }

    if (simulation.blobs.length === 0) {
        
        simulation.deadIndividuals = [];

        for (let i = 0; i < simulation.deadBlobs.length; i++) {
            //let genome = simulation.deadBlobs[i].brain.encode();
            //let fitness = simulation.deadBlobs[i].fitness;
            // let individual = new Individual(genome, fitness);
            // simulation.deadIndividuals.push(individual);
            let individualParams = {
                genome : simulation.deadBlobs[i].brain.encode(),
                fitness : simulation.deadBlobs[i].fitness,
            }
            simulation.createIndividual(individualParams);
        }

        simulation.individuals = simulation.geneticAlgorithm.step(simulation.deadIndividuals);

        for (let i = 0; i < simulation.individuals.length; i++) {
            let blobParams = {
                body : {
                    position : new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800),
                    mass : 0.1 + Math.random() * 0.9,
                    radius : 2.0 + Math.random() * 8,
                    color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                },
                brain : {
                    genome : simulation.individuals[i].genome,
                    params : nnParams,
                }
            }
        
            simulation.createBlob(blobParams);
        }
        
        simulation.deadBlobs = [];

        // Spawn new target
        simulation.world.deleteParticle(target);
        randomPosition = new Vector2((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
        target = simulation.world.createParticle(randomPosition, 0, 20, "rgb(255, 0, 0)");

        simulation.generationTicks = 0;
        simulation.generation++;
    }
}