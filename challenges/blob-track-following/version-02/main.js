"use strict";

// This version implements raytracing to detect obstacles and trains blobs to follow a race track.
// The simulation uses renderer version 2 which takes simulation as a parameter.
// TODO:
// Create blob class that can be used for both target-seeking and track-following by injecting fitness function.


import { Vector2 } from '../../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../../simulation-engine/version-04/simulationEngine.js';

// Neural network parameters
const nnParams = {
	layers : [10, 16, 2], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

// Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.05,  // Fraction of fittest individuals that will be cloned to next generation.
    // Genetic operators
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

// Set up simulation world and entities
const simulation = new SimulationEngine.Simulation(simParams);

// Set up simulation world and entities
createTrack();
createBlobs();


// Run simulation
//setInterval(update, 1000/60);
setInterval(update, 0);
window.requestAnimationFrame(render);

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.generationTicks++;
    simulation.roboBlobs.forEach(b => { b.followTrack(simulation.world.lineSegments)});
    simulation.update();
    evaluate();
}

function evaluate() {
    //
    for (let i = 0; i < simulation.roboBlobs.length; i++) {
        let blob = simulation.roboBlobs[i];
        if (blob.timeouts(1000) || blob.touchesWall()) {
            blob.calculateFitness();
            console.log("fitness: " + blob.fitness);
            simulation.deleteRoboBlob(blob);
        } else {
            blob.ticksAlive++;
            blob.updateFitness();
        }
    }

    if (simulation.roboBlobs.length === 0) {
        
        simulation.deadIndividuals = [];

        for (let i = 0; i < simulation.deadRoboBlobs.length; i++) {
            let individualParams = {
                genome : simulation.deadRoboBlobs[i].brain.encode(),
                fitness : simulation.deadRoboBlobs[i].fitness,
            }
            simulation.createIndividual(individualParams);
        }

        simulation.individuals = simulation.geneticAlgorithm.step(simulation.deadIndividuals);

        for (let i = 0; i < simulation.individuals.length; i++) {
            let randomPosition = new Vector2(-360, 0).add( new Vector2((Math.random()-0.5) * 20, (Math.random()-0.5) * 100));
            let blobParams = {
                body : {
                    position : randomPosition,
                    mass : 1,
                    radius : 8,
                    color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                },
                brain : {
                    genome : simulation.individuals[i].genome,
                    params : nnParams,
                },
                eyes : {
                    position : randomPosition,
                    direction : Math.PI * 2 * 0,
                    numRays : 8,
                    fov : Math.PI * 2 * 1 - Math.PI * 2 * 1/8,
                }
            }
        
            simulation.createRoboBlob(blobParams);
        }
        
        simulation.deadRoboBlobs = [];

        simulation.generationTicks = 0;
        simulation.generation++;
    }
}

function createBlobs() {

    for(let i = 0; i < 500; i++){
        let randomPosition = new Vector2(-360, 0).add( new Vector2((Math.random()-0.5) * 20, (Math.random()-0.5) * 100));
        let blobParams = {
            body : {
                position : randomPosition,
                mass : 1,
                radius : 8,
                color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
            },
            brain : {
                genome : null,
                params : nnParams,
            },
            eyes : {
                position : randomPosition,
                direction : Math.PI * 2 * 0,
                numRays : 8,
                fov : Math.PI * 2 * 1 - Math.PI * 2 * 1/8,
            }
        }
        simulation.createRoboBlob(blobParams);
    }
}

function createTrack() {

    // Create a circular track with Points and LineSegments
    const outerTrackPoints = [];
    const innerTrackPoints = [];

    const trackOuterSegmentLength = 200;
    const trackInnerSegmentLength = 150;
    const trackOuterRadius = 450;
    const trackInnerRadius = 250;
    const trackOuterSegments = Math.floor(Math.PI * 2 * trackOuterRadius / trackOuterSegmentLength);
    const trackInnerSegments = Math.floor(Math.PI * 2 * trackInnerRadius / trackInnerSegmentLength);
    const trackOuterSegmentAngle = Math.PI * 2 / trackOuterSegments;
    const trackInnerSegmentAngle = Math.PI * 2 / trackInnerSegments;
    const trackPointRandomizer = 50;

    for (let i = 0; i < trackOuterSegments; i++) { 
        let angle = i * trackOuterSegmentAngle;
        let position = new Vector2(Math.cos(angle) * trackOuterRadius, Math.sin(angle) * trackOuterRadius);
        position = position.add(new Vector2((Math.random() - 0.5) * trackPointRandomizer, (Math.random() - 0.5) * trackPointRandomizer));
        let mass = 2;
        let radius = 3;
        let color = "rgb(255, 0, 0)";
        //let particle = simulation.world.createParticle(position, mass, radius, color);
        let particle = simulation.world.createPoint(position);
        outerTrackPoints.push(particle);
    }
    
    for (let i = 0; i < trackInnerSegments; i++) {
        let angle = i * trackInnerSegmentAngle;
        let position = new Vector2(Math.cos(angle) * trackInnerRadius, Math.sin(angle) * trackInnerRadius);
        position = position.add(new Vector2((Math.random() - 0.5) * trackPointRandomizer, (Math.random() - 0.5) * trackPointRandomizer));
        position = position.add(new Vector2(-80, 0));
        let mass = 1;
        let radius = 3;
        let color = "rgb(255, 0, 0)";
        //let particle = simulation.world.createParticle(position, mass, radius, color);
        let particle = simulation.world.createPoint(position);
        innerTrackPoints.push(particle);
    }
    
    for (let i = 0; i < outerTrackPoints.length; i++) {
        let pointA = outerTrackPoints[i];
        let pointB = outerTrackPoints[(i + 1) % outerTrackPoints.length];
        //let linearSpring = simulation.world.createLinearSpring(pointA, pointB, 1, 1, 1);
        let lineSegment = simulation.world.createLineSegment(pointA, pointB);
    }
    
    for (let i = 0; i < innerTrackPoints.length; i++) {
        let pointA = innerTrackPoints[i];
        let pointB = innerTrackPoints[(i + 1) % innerTrackPoints.length];
        //let linearSpring = simulation.world.createLinearSpring(pointA, pointB, 1, 1, 1);
        let lineSegment = simulation.world.createLineSegment(pointA, pointB);
    }
}