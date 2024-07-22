"use strict";

/*
 * Copyright (c) 2023 Michael Schmidt Nissen, darwinsrobotolympics@gmail.com
 *
 * All rights reserved.
 *
 * This software and associated documentation files (the "Software"), and the
 * use or other dealings in the Software, are restricted and require the
 * express written consent of the copyright owner. 
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability, 
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other 
 * liability, whether in an action of contract, tort or otherwise, arising 
 * from, out of or in connection with the Software or the use or other 
 * dealings in the Software.
 */

// ******************************************************
//   Neural network engine version 0.2
//
// ******************************************************

// TODO:
// Add createRandomNetwork that takes min / max parameters, and encode to genome, not the other way around.

import { ToolBox } from "../../toolbox/version-01/toolbox.js";

class Neuron {
    constructor() {
        this.inputConnections = []
        this.outputConnections = []
        this.bias = 0
        this.n = 0;
        this.input = 0
        this.output = 0
        //this.init()
    }
    // init() {
    //     this.bias = randomFloatBetween(-10, 10);
    //     this.n = randomFloatBetween(0.0, 4.0);
    //     this.input = 0
    //     this.output = 0
    // }
    addInputConnection(connection) {
        this.inputConnections.push(connection)
    }
    addOutputConnection(connection) {
        this.outputConnections.push(connection)
    }
}

class Connection {
    constructor(from, to) {
        this.from = from
        this.to = to
        this.weight = 0
        //this.init()
    }
    // init() {
    //     this.weight = randomFloatBetween(-10, 10);
    // }
}

class Layer {
    constructor(numberOfNeurons) {
        this.neurons = []
        this.init(numberOfNeurons)
    }
    init(numberOfNeurons) {
        for (let i = 0; i < numberOfNeurons; i++) {
            const neuron = new Neuron()
            this.neurons.push(neuron)
        }
    }
}

class Network {
    constructor(genome = null, params = {}) {
        this.fitness = null;
        this.connections = [];
        this.params = params;
        //this.activation = params.activation;
        this.init(this.params.layers);
        if (genome) {
            this.genome = genome;
            this.decode(genome);
        } else {
            this.genome = this.createRandomGenome();
            this.decode(this.genome);
        }

    }
    init(numberOfLayers) {
        this.createLayers(numberOfLayers);
        this.connectLayers();
    }
    static createInstance(genome, params) {
        return new Network(genome, params);
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
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer]
            const prevLayer = this.layers[layer - 1]
            for (let neuron = 0; neuron < prevLayer.neurons.length; neuron++) {
                for (let neuronInThisLayer = 0; neuronInThisLayer < thisLayer.neurons.length; neuronInThisLayer++) {
                    const connection = new Connection(prevLayer.neurons[neuron], thisLayer.neurons[neuronInThisLayer])
                    prevLayer.neurons[neuron].addOutputConnection(connection)
                    thisLayer.neurons[neuronInThisLayer].addInputConnection(connection)
                    this.connections.push(connection);
                }
            }
        }
    }
    setInput(values) {
        this.layers[0].neurons.forEach((neuron, i) => {
            neuron.output = values[i];
        })
    }
    getOutput() {
        return this.layers[this.layers.length - 1].neurons.map(neuron => neuron.output)
    }
    run() {
        //console.log("Neuron n values:");
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer]
            const prevLayer = this.layers[layer - 1]
            for (let neuron = 0; neuron < thisLayer.neurons.length; neuron++) {
                const thisNeuron = thisLayer.neurons[neuron]
                let sum = 0
                for (let neuronInPrevLayer = 0; neuronInPrevLayer < prevLayer.neurons.length; neuronInPrevLayer++) {
                    const prevNeuron = prevLayer.neurons[neuronInPrevLayer]
                    for (let connection = 0; connection < prevNeuron.outputConnections.length; connection++) {
                        const thisConnection = prevNeuron.outputConnections[connection]
                        if (thisConnection.to === thisNeuron) {
                            sum += prevNeuron.output * thisConnection.weight
                        }
                    }
                }
                sum += thisNeuron.bias
                thisNeuron.input = sum
                //thisNeuron.output = this.params.activation.func(sum, this.params.activation.params);
                thisNeuron.output = this.params.activation.func(sum, {n : thisNeuron.n});
                //thisNeuron.output = this.params.activation.func(sum, {n : 2});

                //console.log(thisNeuron.n);
            }
        }
    }
    recur(numNeurons) {
        // Set the the input of the last numNeurons neurons in the input layer to the output of the last numNeurons neurons in the output layer
        for (let i = 0; i < numNeurons; i++) {
            this.layers[0].neurons[this.layers[0].neurons.length - numNeurons + i].output = this.layers[this.layers.length - 1].neurons[this.layers[this.layers.length - 1].neurons.length - numNeurons + i].output;
        }
    }
    // Encode neural network, including all weights and biases, into a "chromosome" array of floats in the range [0, 1]
    encode() {
        let chromosome = [];
        for (let i = 0; i < this.connections.length; i++) {
            chromosome.push(ToolBox.map(this.connections[i].weight, -10, 10, 0, 1));
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(this.layers[i].neurons[j].bias, -10, 10, 0, 1));
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(this.layers[i].neurons[j].n, 0, 2, 0, 1));
            }
        }
        return chromosome;
    }
    // Decode a "chromosome" array of floats in the range [0, 1] into a neural network, including all weights and biases
    decode(chromosome) {
        let chromosomeIndex = 0;
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].weight = ToolBox.map(chromosome[chromosomeIndex], 0, 1, -10, 10);
            chromosomeIndex++;
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                this.layers[i].neurons[j].bias = ToolBox.map(chromosome[chromosomeIndex], 0, 1, -10, 10);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].neurons.length; j++) {
                this.layers[i].neurons[j].n = ToolBox.map(chromosome[chromosomeIndex], 0, 1, 0, 2);
                chromosomeIndex++;
            }
        }
    }
}


// ******************************************************
//   Neural network activation function library
//
// ******************************************************

class ActivationFunctions {

    // ******************************************************
    //   Linear functions
    // ******************************************************

    //  Binary step / Heaviside step function
    static heaviside(x) {
        return x >= 0 ? 1 : 0;
    }

    // Linear activation function / identity function
    static identity(x) {
        return x;
    }


    // ******************************************************
    //   Nonlinear functions
    // ******************************************************

    // Sigmoid static / Logistic function
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static sigmoidDerivative(y) {
        return y * (1 - y);
    }

    static sigmoidLike(x) {
        return 0.5 + 0.5 * x / (1 + Math.abs(x));
    }

    static sigmoidLikeDerivative(x) {
        return 0.5 / Math.pow(1 + Math.abs(x), 2);
    }

    static sigmoidLike2(x, params = {}) {
        let n = params.n;
        // n < 1 gives a steeper sigmoid
        // n > 1 gives a flatter sigmoid
        // n = 0 equals binary perceptron / Heaviside step function behavior
        return 0.5 + 0.5 * x / (n + Math.abs(x));
    }

    // Hyperbolic tangent / tanh
    static tanh(x) {
        return Math.tanh(x);
    }

    static tanhDerivative(x) {
        let y = Math.tanh(x);
        return 1 - y * y; // Ok
    }

    static tanhLike(x) {
        return x / (1 + Math.abs(x));
    }

    static tanhlikeDerivative(x) {
        return 1 / Math.pow(1 + Math.abs(x), 2);
    }

    static tanhLike2(x, params = {}) {
        let n = params.n;
        // n < 1 gives a steeper sigmoid
        // n > 1 gives a flatter sigmoid
        // n = 0 gives binary perceptron / Heaviside step function behavior
        return x / (n + Math.abs(x));
    }

    static tanhlike2Derivative(x, n = 1.0) {
        return n / Math.pow(n + Math.abs(x), 2);
    }

    static rationalTanh(x) {
        if (x < -3) return -1;
        if (x > 3) return 1;
        // Original function
        //return x * (27 + x * x) / (27 + 9 * x * x);
        // My optimized version
        let m = 2.7;
        let n = 7.5;
        return x * (m * n + x * x) / (m * n + n * x * x);
    }

    // ReLU (Rectified Linear Unit)
    static relu(x) {
        return Math.max(0, x);
    }

    static reluDerivative(x) {
        if (x >= 0) return 1;
        return 0;
    }

    // Leaky ReLU
    static leakyRelu(x) {
        return Math.max(0.1 * x, x);
    }

    static leakyReluDerivative(x) {
        if (x >= 0) return 1;
        return 0.1;
    }

    // Parametric ReLU
    static parametricRelu(x, a = 0.01) {
        return Math.max(a * x, x);
    }

    static parametricReluDerivative(x, a = 0.01) {
        if (x >= 0) return 1;
        return a;
    }

    // Exponential linear unit (ELU)
    static elu(x, a = 0.01) {
        if (x >= 0) return x;
        return a * (Math.exp(x) - 1);
    }

    static eluDerivative(x, a = 0.01) {
        if (x >= 0) return 1;
        return a * Math.exp(x); // ?
    }


    // ******************************************************
    //   Experimental functions
    // ******************************************************

    static sin(x) {
        return Math.sin(x);
    }

    static cos(x) {
        return Math.cos(x);
    }

    static tan(x) {
        return Math.tan(x);
    }

    static sinMoid(x) {
        let a = 2;
        let b = 0.5;
        return 0.5 + 0.5 * Math.sin(Math.PI * (a * x + b));
    }
}

export { Network, ActivationFunctions };