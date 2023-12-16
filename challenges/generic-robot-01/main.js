"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../simulation-engine/version-05/simulationEngine.js';

const numWorms = 80;

//Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 10,
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

const nnParams = {
    // 7 inputs, one for each ray in rayCamera, 24 hidden neurons (arbtrary number), 7 + 6 outputs, one for each linear spring and angular spring.
	layers : [7, 24, 6], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
};

const robWormParams = {
    body : {
        position : new Vector2(0, 100),
        numSegments : 8,
        radius : 14.0,
        mass : 1.0,
        color : "rgb(255, 255, 255)",
    },
    brain : {
        genome : null,
        params : nnParams,
    },
    senses : {
        vision : {
            position : new Vector2(0, 100), //
            direction : Math.PI * 2 * 0.0,
            numRays : 7,
            fov : Math.PI * 2 * 0.25,
        }
    }
};

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

// Create simulation
const simulation = new SimulationEngine.Simulation(simParams);

for (let i = 0; i < 80; i++) {

    let randomPosition = new Vector2(0, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
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

    simulation.createRoboWorm(robWormParams);
}

createWorld();

// Run simulation
//setInterval(update, 1000/60);  // Physics
setInterval(update, 0);
window.requestAnimationFrame(render);

 // Rendering
function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
};

  // Physics
function update() {
    simulation.generationTicks++;
    simulation.roboWorms.forEach(w => { w.update(); });
    simulation.update();
    evaluatePopulation();
};

function evaluatePopulation() {
    
    // if (simulation.generationTicks > 900) {
    //     deleteWorms();
    // } else {
    //     for (let i = 0; i < simulation.roboWorms.length; i++) {
    //         let worm = simulation.roboWorms[i];
    //         worm.ticksAlive++;
    //         worm.calculateScore();
    //     }
    // }
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

    // If all worms are dead, create new generation
    if (simulation.roboWorms.length === 0) {
        
        simulation.deadIndividuals = [];

        for (let i = 0; i < simulation.deadRoboWorms.length; i++) {
            let individualParams = {
                genome : simulation.deadRoboWorms[i].brain.encode(),
                fitness : simulation.deadRoboWorms[i].fitness,
            }
            simulation.createIndividual(individualParams);
        }

        // console.log("simulation.deadIndividuals");
        // console.log(simulation.deadIndividuals);

        // Run genetic algorithm on individuals
        simulation.individuals = simulation.geneticAlgorithm.step(simulation.deadIndividuals);

        // console.log("simulation.individuals");
        // console.log(simulation.individuals);
        
        deleteWorld();
        createWorld();
        
        for (let i = 0; i < simulation.individuals.length; i++) {

            let randomPosition = new Vector2(0, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
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

            simulation.createRoboWorm(robWormParams);
        }
        
        simulation.deadRoboWorms = [];
        simulation.world.collisions = new Map();
        simulation.generationTicks = 0;
        simulation.generation++;
    }
};

function createWorms(numWorms = 1, individuals = null) {
    let n = individuals ? individuals.length : numWorms;

    console.log("individuals");
    console.log(individuals);

    for (let i = 0; i < n; i++) {
        let params = robWormParams;
        params.body.color = "rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", 255)";
        params.brain.genome = individuals ? individuals[i].genome : null;
        simulation.createRoboWorm(params);
    }
};

function deleteWorms() {
    for (let i = 0; i < simulation.roboWorms.length; i++) {
        let worm = simulation.roboWorms[i];
        worm.calculateFitness();
        console.log("fitness: " + worm.fitness);
        simulation.deleteRoboWorm(worm);
    }
}

function createWorld() {
    // Params
    let top = -400;
    let bottom = 400;
    let left = -400;
    let right = 3600;
    let numSegments = 8;
    let segmentWidth = (right-left) / numSegments;
    let segmentBaseHeight = bottom + 50;
    let segmentRandomization = 25;

    let bottomPoints = [];

    // Create world
    let topLeftPoint = simulation.world.createPoint(new Vector2(left, top));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, top));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, bottom));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, bottom));

    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(topLeftPoint, bottomLeftPoint);

    let p1 = bottomLeftPoint;

    for (let i = 0; i < numSegments-1; i++) {
        let height = segmentBaseHeight + (Math.random() * segmentRandomization * 2 - segmentRandomization);
        let p2 = simulation.world.createPoint(new Vector2(left + segmentWidth * (i + 1), height));
        bottomPoints.push(simulation.world.createLineSegment(p1, p2));
        p1 = p2;
    }

    bottomPoints.push(simulation.world.createLineSegment(p1, bottomRightPoint));
};

function deleteWorld() {
    simulation.world.lineSegments = [];
    simulation.world.points = [];
}