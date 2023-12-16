"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../simulation-engine/version-05/simulationEngine.js';

const nnParams = {
    // 7 inputs, one for each ray in rayCamera, 24 hidden neurons (arbtrary number), 7 + 6 outputs, one for each linear spring and angular spring.
	layers : [7, 12, 6], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

//Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.05,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 5,
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
            mutationChance : 0.05, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

// Create simulation
const simulation = new SimulationEngine.Simulation(simParams);

for (let i = 0; i < 80; i++) {
    let randomPosition = new Vector2(-800, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
    let robWormParams = {
        body : {
            position : randomPosition, //new Vector2(-300, -350),
            numSegments : 8,
            radius : 14,
            mass : 2,
            color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
        },
        brain : {
            genome : null,
            params : nnParams,
        },
        senses : {
            vision : {
                position : randomPosition, //
                direction : Math.PI * 2 * 0,
                numRays : 7,
                fov : Math.PI * 2 * 0.25,
            }
        }
    }

    simulation.createRobWorm(robWormParams);
}


createWorld();

// Run simulation
//setInterval(update, 1000/60);  // Physics
setInterval(update, 0);  // Physics
window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.generationTicks++;
    simulation.roboWorms.forEach(w => { w.update(); });
    simulation.update();
    evaluate();
}

function evaluate() {
    
    //
    for (let i = 0; i < simulation.roboWorms.length; i++) {
        let worm = simulation.roboWorms[i];
        //if (worm.timeouts(1000)) {
        if (simulation.generationTicks > 900) {
            worm.calculateFitness();
            console.log("fitness: " + worm.fitness);
            simulation.deleteRoboWorm(worm);
        } else {
            worm.ticksAlive++;
            worm.calculateScore();
        }
    }

    //
    if (simulation.roboWorms.length === 0) {
        
        simulation.deadIndividuals = [];

        for (let i = 0; i < simulation.deadRoboWorms.length; i++) {
            let individualParams = {
                genome : simulation.deadRoboWorms[i].brain.encode(),
                fitness : simulation.deadRoboWorms[i].fitness,
            }
            simulation.createIndividual(individualParams);
        }

        simulation.individuals = simulation.geneticAlgorithm.step(simulation.deadIndividuals);

        for (let i = 0; i < simulation.individuals.length; i++) {

            let randomPosition = new Vector2(-800, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
            let robWormParams = {
                body : {
                    position : randomPosition, //new Vector2(-300, -350),
                    numSegments : 8,
                    radius : 14,
                    mass : 2,
                    color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                },
                brain : {
                    genome : simulation.individuals[i].genome,
                    params : nnParams,
                },
                senses : {
                    vision : {
                        position : randomPosition, //
                        direction : Math.PI * 2 * 0,
                        numRays : 7,
                        fov : Math.PI * 2 * 0.25,
                    }
                }
            }

            simulation.createRobWorm(robWormParams);
        }
        
        simulation.deadRoboWorms = [];

        simulation.world.collisions = new Map();

        simulation.generationTicks = 0;
        simulation.generation++;
    }
}

function createWorld() {
    // Create world
    let topLeft = simulation.world.createPoint(new Vector2(-1200, -400));
    let topRight = simulation.world.createPoint(new Vector2(1200, -400));
    let bottomRight = simulation.world.createPoint(new Vector2(1200, 400));
    let bottomLeft = simulation.world.createPoint(new Vector2(-1200, 400));
    let bottomCenter = simulation.world.createPoint(new Vector2(0, 350));

    let top = simulation.world.createLineSegment(topLeft, topRight);
    let right = simulation.world.createLineSegment(topRight, bottomRight);
    let bottom1 = simulation.world.createLineSegment(bottomRight, bottomCenter);
    let bottom2 = simulation.world.createLineSegment(bottomCenter, bottomLeft);
    //let bottom = simulation.world.createLineSegment(bottomRight, bottomLeft);
    let left = simulation.world.createLineSegment(bottomLeft, topLeft);
}