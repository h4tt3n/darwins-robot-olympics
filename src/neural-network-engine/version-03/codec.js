"use strict";

import { ToolBox } from "../../../toolbox/version-01/toolbox.js";

class Codec {
    constructor(params) {
        this.minBiasValue = params.minBiasValue ?? -100;
        this.maxBiasValue = params.maxBiasValue ?? 100;
        this.minWeightValue = params.minWeightValue ?? -10000;
        this.maxWeightValue = params.maxWeightValue ?? 10000;
        this.minNValue = params.minNValue ?? 0;
        this.maxNValue = params.maxNValue ?? 1000;
    }

    createRandomGenome(network) {
        let genome = [];
        let numLinks = 0;
        for (let i = 1; i < network.layers.length; i++) {
            numLinks += network.layers[i].connections.length;
        }

        let numBiasesAndNs = 0;
        for (let i = 1; i < network.layers.length; i++) {
            numBiasesAndNs += network.layers[i].neurons.length;
        }
        
        // Total genes = weights + biases + n_values
        let numGenes = numLinks + numBiasesAndNs + numBiasesAndNs;

        for (let i = 0; i < numGenes; i++) {
            genome.push(Math.random());
        }
        return genome;
    }

    encode(network) {
        let chromosome = [];
        for (let i = 1; i < network.layers.length; i++) {
            for (const connection of network.layers[i].connections) {
                chromosome.push(ToolBox.map(connection.weight, this.minWeightValue, this.maxWeightValue, 0, 1));
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (const neuron of network.layers[i].neurons) {
                chromosome.push(ToolBox.map(neuron.bias, this.minBiasValue, this.maxBiasValue, 0, 1));
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (const neuron of network.layers[i].neurons) {
                chromosome.push(ToolBox.map(neuron.n, this.minNValue, this.maxNValue, 0, 1));
            }
        }
        return chromosome;
    }

    decode(network, chromosome) {
        let chromosomeIndex = 0;
        for (let i = 1; i < network.layers.length; i++) {
            for (const connection of network.layers[i].connections) {
                connection.weight = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minWeightValue, this.maxWeightValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (const neuron of network.layers[i].neurons) {
                neuron.bias = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minBiasValue, this.maxBiasValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (const neuron of network.layers[i].neurons) {
                neuron.n = ToolBox.map(chromosome[chromosomeIndex], 0, 1, this.minNValue, this.maxNValue);
                chromosomeIndex++;
            }
        }
    }
}

export { Codec };