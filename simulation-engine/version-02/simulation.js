"use strict";

// This verison of the simulation uses renderer version 2 which takes simulation as a parameter.
// What does this class need to own and do?

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Network } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, Individual } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from './renderer.js';
import { Blob } from '../../entities/blob/target-seeking-version-01/blob.js';
import { Car } from '../../entities/car/version-01/car.js';
import { Ray, RayCamera } from './rayCaster.js';

class Simulation {
    constructor(params = {}) {
        this.gaParams = params.gaParams;
        
        this.world = new SquishyPlanet.World();
        this.renderer = new Renderer('canvas', this);
        //console.log(this.renderer);
        this.geneticAlgorithm = new GeneticAlgorithm(params.gaParams);

        this.rays = [];
        this.rayCameras = [];

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
        
        let position = params.body.position || new Vector2(0, 0);
        let mass = params.body.mass || 1;
        let radius = params.body.radius || 1;
        let color = params.body.color || 'white';
        let brain = new Network(params.brain.genome, params.brain.params);

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
    createCar() {
        let car = new Car();
        this.cars.push(car);
        return car;
    }
    deleteCar(car) {
        this.cars.splice(this.cars.indexOf(car), 1);
        this.deadCars.push(car);
    }
    createIndividual(params = {}) {
        let individual = new Individual(params.genome, params.fitness);
        this.deadIndividuals.push(individual);
        return individual;
    }
    deleteIndividual(individual) {
        this.individuals.splice(this.individuals.indexOf(individual), 1);
        this.deadIndividuals.push(individual);
    }
    createRay(origin, direction) {
        let ray = new Ray(origin, direction);
        this.rays.push(ray);
        return ray;
    }
    deleteRay(ray) {
        this.rays.splice(this.rays.indexOf(ray), 1);
    }
    createRayCamera(origin, direction, numRays, width) {
        let rayCamera = new RayCamera(origin, direction, numRays, width);
        this.rayCameras.push(rayCamera);
        return rayCamera;
    }
    deleteRayCamera(rayCamera) {
        this.rayCameras.splice(this.rayCameras.indexOf(rayCamera), 1);
    }
}

export { Simulation };