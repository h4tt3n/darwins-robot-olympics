"use strict";

// This verison of the simulation uses renderer version 1 which takes world as a parameter.
// What does this class need to own and do?

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Network, ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, GeneticOperators, Individual } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from '../../modules/renderer/version-01/renderer.js';
import { Blob } from '../../entities/blob/target-seeking-version-01/blob.js';

class Simulation {
    constructor(params = {}) {
        this.gaParams = params.gaParams;
        
        this.world = new SquishyPlanet.World();
        this.renderer = new Renderer('canvas', this.world);
        this.geneticAlgorithm = new GeneticAlgorithm(params.gaParams);

        this.rayCasters = [];

        //
        this.individuals = [];
        this.deadIndividuals = [];
        this.blobs = [];
        this.deadBlobs = [];
        this.cars = [];
        this.deadCars = [];
        this.rockets = [];
        this.deadRockets = [];
        this.roboCrabs = [];
        this.deadRoboCrabs = [];
        
        this.generation = 0;
        this.generationTicks = 0;
    }
    createBlob(params = {}) {
        
        // TODO: put this in params
        let nnParams = {
            layers : [4, 8, 2],
            activation : { func : ActivationFunctions.tanhLike2 }
        }
        
        let position = params.body.position || new Vector2(0, 0);
        let mass = params.body.mass || 1;
        let radius = params.body.radius || 1;
        let color = params.body.color || 'white';
        let brain = params.brain || new Network(null, nnParams);

        let body = this.world.createParticle(position, mass, radius, color);
        let blob = new Blob(brain, body);
        this.blobs.push(blob);
        return blob;
    }
    deleteBlob(blob) {
        this.world.deleteParticle(blob.body);
        this.blobs.splice(this.blobs.indexOf(blob), 1);
        this.deadBlobs.push(blob);
    }
    createIndividual(params = {}) {
        let individual = new Individual(params.genome, params.params);
        this.individuals.push(individual);
        return individual;
    }
    deleteIndividual(individual) {
        this.individuals.splice(this.individuals.indexOf(individual), 1);
        this.deadIndividuals.push(individual);
    }
}

export { Simulation };