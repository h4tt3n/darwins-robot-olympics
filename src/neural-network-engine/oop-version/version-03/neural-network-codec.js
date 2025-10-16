"use strict";

import { ToolBox } from "../../../toolbox/version-01/toolbox.js";

class Codec {
    
    static createRandomGenome(network) {
        let genome = [];
        // Calculate number of links
        let numLinks = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer]
            const prevLayer = network.layers[layer - 1]
            numLinks += prevLayer.neurons.length * thisLayer.neurons.length
        }
        // Calculate number of biases
        let numBiases = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer]
            numBiases += thisLayer.neurons.length
        }
        // Calculate number of ns
        let numNs = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer]
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
    
    // Encode neural network, including all weights and biases, into a "chromosome" array of floats in the range [0, 1]
    static encode(network) {
        let chromosome = [];
        for (let i = 1; i < network.layers.length; i++) {
            for (const connection of network.layers[i].connections) {
                chromosome.push(ToolBox.map(connection.weight, network.minWeightValue, network.maxWeightValue, 0, 1));
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(network.layers[i].neurons[j].bias, network.minBiasValue, network.maxBiasValue, 0, 1));
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].neurons.length; j++) {
                chromosome.push(ToolBox.map(network.layers[i].neurons[j].n, network.minNValue, network.maxNValue, 0, 1));
            }
        }
        return chromosome;
    }
    
    // Decode a "chromosome" array of floats in the range [0, 1] into a neural network, including all weights and biases
    static decode(chromosome, network) {
        let chromosomeIndex = 0;
        for (let i = 1; i < network.layers.length; i++) {
            for (const connection of network.layers[i].connections) {
                connection.weight = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minWeightValue, network.maxWeightValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].neurons.length; j++) {
                network.layers[i].neurons[j].bias = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minBiasValue, network.maxBiasValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].neurons.length; j++) {
                network.layers[i].neurons[j].n = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minNValue, network.maxNValue);
                chromosomeIndex++;
            }
        }
    }
}

export { Codec };