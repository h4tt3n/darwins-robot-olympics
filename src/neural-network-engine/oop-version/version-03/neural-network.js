"use strict";

import { ActivationFunctions } from "./activation-functions.js";
import { ToolBox } from "../../../toolbox/version-01/toolbox.js";
import { Codec } from "./neural-network-codec.js"

class Neuron {
    constructor() {
        this.bias = 0;
        this.n = 0;
        this.input = 0;
        this.output = 0;
    }
}

class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.weight = 0;
    }
}

class Layer {
    constructor(numberOfNeurons) {
        this.neurons = [];
        this.connections = [];
        this.init(numberOfNeurons);
    }

    init(numberOfNeurons) {
        for (let i = 0; i < numberOfNeurons; i++) {
            const neuron = new Neuron();
            this.neurons.push(neuron);
        }
    }
}

class Network {
    constructor(params = {}) {
        this.layers = [];
        this.fitness = null;
        this.params = params;
        this.minBiasValue = -100;
        this.maxBiasValue = 100;
        this.minWeightValue = -10000;
        this.maxWeightValue = 10000;
        this.minNValue = 0;
        this.maxNValue = 1000;
        
        this.init(this.params.layers);
    }

    init(numberOfLayers) {
        this.createLayers(numberOfLayers);
        this.connectLayers();
    }

    static createInstance(genome, params) {
        return new Network(genome, params);
    }

    initiateNeuralNetwork() {
        for (let i = 1; i < this.layers.length; i++) {
            for (const connection of this.layers[i].connections) {
                 connection.weight = ToolBox.lerp(this.minWeightValue, this.maxWeightValue, Math.random());
            }
        }

        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                this.layers[i].neurons[j].bias = ToolBox.lerp(this.minBiasValue, this.maxBiasValue, Math.random());
                this.layers[i].neurons[j].n = ToolBox.lerp(this.minNValue, this.maxNValue, Math.random());
            }
        }
    }

    createLayers(numberOfLayers) {
        this.layers = numberOfLayers.map((length) => {
            const layer = new Layer(length)
            return layer
        })
    }

    connectLayers() {
        for (let i = 1; i < this.layers.length; i++) {
            const thisLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];
            for (let j = 0; j < prevLayer.neurons.length; j++) {
                for (let k = 0; k < thisLayer.neurons.length; k++) {
                    const connection = new Connection(prevLayer.neurons[j], thisLayer.neurons[k]);
                    thisLayer.connections.push(connection);
                }
            }
        }
    }

    setInput(values) {
        this.layers[0].neurons.forEach((neuron, i) => {
            neuron.output = values[i];
        })
    }

    getInputs() {
        return this.layers[0].neurons.map(neuron => neuron.output)
    }

    getOutput() {
        return this.layers[this.layers.length - 1].neurons.map(neuron => neuron.output)
    }

    run() {
        
        for (let i = 1; i < this.layers.length; i++) {
            const thisLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];

            for (let j = 0; j < thisLayer.neurons.length; j++) {
                const thisNeuron = thisLayer.neurons[j];
                let sum = 0;

                for (let k = 0; k < prevLayer.neurons.length; k++) {
                    const prevNeuron = prevLayer.neurons[k];
                    const connectionIndex = k * thisLayer.neurons.length + j;
                    const connection = thisLayer.connections[connectionIndex];
                    sum += prevNeuron.output * connection.weight;
                }

                sum += thisNeuron.bias;
                thisNeuron.input = sum;
                thisNeuron.output = this.params.activation.func(sum, { n: thisNeuron.n });
            }
        }
    }
}

export { Network };