"use strict";

// ******************************************************
//   Neural network engine version 0.3
//
// Init params json structure example:
// {
//     layers : [
//         {
//             numNeurons : 2,
//             activation : {
//                 func : ActivationFunctions.parameterizedIdentity,
//                 param : { min : 0, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -10000, max : 10000 }
//         },
//         {
//             numNeurons : 3,
//             activation : {
//                 func : ActivationFunctions.parameterizedIdentity,
//                 param : { min : 0, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -10000, max : 10000 }
//         },
//         {
//             numNeurons : 2,
//             activation : {
//                 func : ActivationFunctions.parameterizedSoftSign,
//                 param : { min : 0, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -10000, max : 10000 }
//         },
// }
//
// ******************************************************

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { ActivationFunctions } from "./activation-functions.js";

class Neuron {
    constructor() {
        this.bias = null;
        this.activationParameter = null;
        this.input = null;
        this.output = null;
    }
    init() {

    }
}

class Connection {
    constructor(inputNeuron, outputNeuron) {
        this.weight = null;
        this.input = inputNeuron;
        this.output = outputNeuron;
    }
    init() {
        
    }
}

class Layer {
    constructor(numNeurons) {
        this.neurons = [];
        this.init(numNeurons);
    }
    init(numNeurons) {
        for (let i = 0; i < numNeurons; i++) {
            const neuron = new Neuron();
            this.neurons.push(neuron);
        }
    }
}

class NeuralNetwork {
    constructor() {
        this.layers = [];
        this.connections = [];
    }
    init() {
        
    }
}