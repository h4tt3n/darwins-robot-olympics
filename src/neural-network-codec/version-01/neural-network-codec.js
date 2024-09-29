"use strict";

class NeuralNetworkCodec {
    static createRandomGenome(network) {
        let genome = [];
        // Calculate number of links
        let numLinks = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer];
            const prevLayer = network.layers[layer - 1];
            numLinks += prevLayer.nodes.length * thisLayer.nodes.length;
        }
        // Calculate number of biases
        let numBiases = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer];
            numBiases += thisLayer.nodes.length;
        }
        // Calculate number of ns
        let numNs = 0;
        for (let layer = 1; layer < network.layers.length; layer++) {
            const thisLayer = network.layers[layer];
            numNs += thisLayer.nodes.length;
        }
        // Calculate total number of genes
        let numGenes = numLinks + numBiases + numNs;

        for (let i = 0; i < numGenes; i++) {
            let gene = Math.random();
            genome.push(gene);
        }
        return genome;
    }

    static encode(network) {
        let chromosome = [];
        for (let i = 0; i < network.links.length; i++) {
            chromosome.push(ToolBox.map(network.links[i].weight, network.minWeightValue, network.maxWeightValue, 0, 1));
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].nodes.length; j++) {
                chromosome.push(ToolBox.map(network.layers[i].nodes[j].bias, network.minBiasValue, network.maxBiasValue, 0, 1));
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].nodes.length; j++) {
                chromosome.push(ToolBox.map(network.layers[i].nodes[j].n, network.minNValue, network.maxNValue, 0, 1));
            }
        }
        return chromosome;
    }

    static decode(network, chromosome) {
        let chromosomeIndex = 0;
        for (let i = 0; i < network.links.length; i++) {
            network.links[i].weight = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minWeightValue, network.maxWeightValue);
            chromosomeIndex++;
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].nodes.length; j++) {
                network.layers[i].nodes[j].bias = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minBiasValue, network.maxBiasValue);
                chromosomeIndex++;
            }
        }
        for (let i = 1; i < network.layers.length; i++) {
            for (let j = 0; j < network.layers[i].nodes.length; j++) {
                network.layers[i].nodes[j].n = ToolBox.map(chromosome[chromosomeIndex], 0, 1, network.minNValue, network.maxNValue);
                chromosomeIndex++;
            }
        }
    }
}

export { NeuralNetworkCodec };