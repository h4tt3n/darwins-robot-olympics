"use strict";

// This version works with two versions of Blobs, target-seeking and track-following. Refactor.
// What does this class need to own and do?

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Network } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticAlgorithm, Individual } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { Renderer } from './renderer.js';
import { Ray, RayCamera } from './rayCaster.js';
import { WayPoint } from './wayPoint.js';
import { RaceTrackBlob } from '../../entities/blob/track-following-version-01/blob.js';
import { Car } from '../../entities/car/version-01/car.js';

class Simulation {
    constructor(params = {}) {
        this.gaParams = params.gaParams;

        this.world = new SquishyPlanet.World();
        this.renderer = new Renderer('canvas', this);
        this.geneticAlgorithm = new GeneticAlgorithm(params.gaParams);

        this.rays = [];
        this.rayCameras = [];
        this.wayPoints = [];

        //
        this.individuals = [];
        this.deadIndividuals = [];
        this.trackFollowingBlobs = [];
        this.deadTrackFollowingBlobs = [];
        this.cars = [];
        this.deadCars = [];
        this.rockets = [];
        this.deadRockets = [];
        this.roboCrabs = [];
        this.deadRoboCrabs = [];

        this.generation = 0;
        this.generationTicks = 0;
    }
    update() {
        this.world.update();
        for (let i = 0; i < this.trackFollowingBlobs.length; i++) {
            let blob = this.trackFollowingBlobs[i];
            blob.eyes.origin = blob.body.position;
            blob.eyes.update();
        }
    }
    createWaypoint(position, radius, color) {
        let wayPoint = new WayPoint(position, radius, color);
        this.wayPoints.push(wayPoint);
        return wayPoint;
    }
    deleteWaypoint(wayPoint) {
        this.wayPoints.splice(this.wayPoints.indexOf(wayPoint), 1);
    }
    createTrackFollowingBlob(params = {}) {

        let position = params.body.position || new Vector2(0, 0);
        let mass = params.body.mass || 1;
        let radius = params.body.radius || 1;
        let color = params.body.color || 'white';

        let brain = new Network(params.brain.genome, params.brain.params);
        let body = this.world.createParticle(position, mass, radius, color);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);

        let blob = new RaceTrackBlob(brain, body, eyes);
        this.trackFollowingBlobs.push(blob);
        return blob;
    }
    deleteTrackFollowingBlob(blob) {
        this.world.deleteParticle(blob.body);
        this.deleteRayCamera(blob.eyes);
        this.trackFollowingBlobs.splice(this.trackFollowingBlobs.indexOf(blob), 1);
        this.deadTrackFollowingBlobs.push(blob);
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