"use strict";

import { ActivationFunctions } from "./activation-functions.js";
import { ToolBox } from "../../../toolbox/version-01/toolbox.js";

class Neuron {
    constructor() {
        this.bias = 0;
        this.n = 0;
        this.input = 0;
        this.output = 0;
        //this.init()
    }
    // init() {
    //     this.bias = randomFloatBetween(-10, 10);
    //     this.n = randomFloatBetween(0.0, 4.0);
    //     this.input = 0
    //     this.output = 0
    // }
}

class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.weight = 0;
        //this.init()
    }
    // init() {
    //     this.weight = randomFloatBetween(-10, 10);
    // }
}

class Layer {
    constructor(numberOfNeurons) {
        this.neurons = [];
        this.connections = []; // Connections leading into this layer's neurons
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
    constructor(genome = null, params = {}) {
        this.fitness = null;
        this.params = params;
        this.minBiasValue = -100;
        this.maxBiasValue = 100;
        this.minWeightValue = -10000;
        this.maxWeightValue = 10000;
        this.minNValue = 0;
        this.maxNValue = 1000;
        //this.activation = params.activation;
        this.init(this.params.layers);
        if (genome) {
            this.genome = genome;
            this.decode(this.genome);
        } else {
            this.genome = this.createRandomGenome();
            this.decode(this.genome);
            // this.initiateNeuralNetwork();
            // this.genome = this.encode();
        }

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
                // console.log(this.minNValue, this.maxNValue, this.layers[i].neurons[j].n)
            }
        }
    }
    createRandomGenome() {
        let genome = [];
        // Calculate number of links
        let numLinks = 0;
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer]
            const prevLayer = this.layers[layer - 1]
            numLinks += prevLayer.neurons.length * thisLayer.neurons.length
        }
        // Calculate number of biases
        let numBiases = 0;
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer]
            numBiases += thisLayer.neurons.length
        }
        // Calculate number of ns
        let numNs = 0;
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer]
            numNs += thisLayer.neurons.length;
        }
        // Calculate total number of genes
        let numGenes = numLinks + numBiases + numNs;

        for (let i = 0; i < numGenes; i++) {
            let gene = Math.random();
            genome.push(gene);
        }
        return genome;
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
                    // Add connection to the current layer's list
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
        //console.log("Neuron n values:");
        for (let i = 1; i < this.layers.length; i++) {
            const thisLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];

            for (let j = 0; j < thisLayer.neurons.length; j++) {
                const thisNeuron = thisLayer.neurons[j];
                let sum = 0;

                for (let k = 0; k < prevLayer.neurons.length; k++) {
                    const prevNeuron = prevLayer.neurons[k];
                    // Find the connection from the k-th previous neuron to the j-th current neuron
                    const connectionIndex = k * thisLayer.neurons.length + j;
                    const connection = thisLayer.connections[connectionIndex];
                    sum += prevNeuron.output * connection.weight;
                }

                sum += thisNeuron.bias;
                // Original version
                thisNeuron.input = sum;

                // Accumulating input version
                //thisNeuron.input = ToolBox.lerp(thisNeuron.input, sum, 0.5);

                //thisNeuron.output = this.params.activation.func(sum, this.params.activation.params);

                // Original version
                thisNeuron.output = this.params.activation.func(sum, { n: thisNeuron.n });

                // Accumulating output version
                //thisNeuron.output = ToolBox.lerp(thisNeuron.output, this.params.activation.func(sum, {n : thisNeuron.n}), 0.5);
                //thisNeuron.output = this.params.activation.func(sum, {n : 1});

                //console.log(thisNeuron.n);
            }
        }
    }
    // Encode neural network, including all weights and biases, into a "chromosome" array of floats in the range [0, 1]
    encode() {
        let chromosome = [];
        for (let i = 1; i < this.layers.length; i++) {
            for (const connection of this.layers[i].connections) {
                chromosome.push(ToolBox.map(connection.weight, this.minWeightValue, this.maxWeightValue, 0, 1));
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(this.layers[i].neurons[j].bias, this.minBiasValue, this.maxBiasValue, 0, 1));
                //console.log(this.layers[i].neurons[j].bias, this.minBiasValue, this.maxBiasValue, chromosome[chromosome.length - 1]);
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(this.layers[i].neurons[j].n, this.minNValue, this.maxNValue, 0, 1));
                //console.log(this.layers[i].neurons[j].n, this.minNValue, this.maxNValue, chromosome[chromosome.length - 1]);
            }
        }
        return chromosome;
    }
    // Decode a "chromosome" array of floats in the range [0, 1] into a neural network, including all weights and biases
    decode(chromosome) {
        let chromosomeIndex = 0;
        for (let i = 1; i < this.layers.length; i++) {
            for (const connection of this.layers[i].connections) {
                connection.weight = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minWeightValue, this.maxWeightValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                this.layers[i].neurons[j].bias = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minBiasValue, this.maxBiasValue);
                //console.log(chromosome[chromosomeIndex], this.minBiasValue, this.maxBiasValue, this.layers[i].neurons[j].bias);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                this.layers[i].neurons[j].n = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minNValue, this.maxNValue);
                //console.log(chromosome[chromosomeIndex], this.minNValue, this.maxNValue, this.layers[i].neurons[j].n);
                chromosomeIndex++;
            }
        }
    }
}

// let genomeEncoder = function(x) {
//     return 1.0 / (1.0 + x);
// }

// let val = 42.0001337;

// let encodedVal = ActivationFunctions.sigmoid(val);
// let decodedVal = ActivationFunctions.inverseSigmoid(encodedVal);

// console.log({val : val, encodedVal : encodedVal, decodedVal : decodedVal});

// let encodedVal2 = 1.0 / val;
// let decodedVal2 = 1.0 / encodedVal2; 

// console.log({val : val, encodedVal2 : encodedVal2, decodedVal2 : decodedVal2});

export { Network };