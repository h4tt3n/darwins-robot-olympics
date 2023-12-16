"use strict";


class RoboCrab extends RoboBase {
    constructor(brain, body, eyes) {
        super(brain, body, eyes);
    }
    update() {
        // Update brain
        //this.brain.update();

        // Update eyes
        //this.eyes.forEach(eye => { eye.update(); });
    }
    static create(params = {}) {
        let body = {};
        let brain = this.createNeuralNetwork(params.brain.genome, params.brain.params);
        let eyes = this.createRayCamera(params.eyes.position, params.eyes.direction, params.eyes.numRays, params.eyes.fov);
        let crab = new RoboCrab(brain, body, eyes);
        this.roboCrabs.push(crab);
        return crab;
    }
}
