"use strict";

// ******************************************************
//   Neural network engine version 0.2
//
// ******************************************************

import { ToolBox } from "../../toolbox/version-01/toolbox.js";

class Node {
    constructor() {
        this.inputLinks = [];
        this.outputLinks = [];
        this.bias = 0;
        this.n = 0;
        this.input = 0;
        this.output = 0;
    }
    addInputLink(link) {
        this.inputLinks.push(link);
    }
    addOutputLink(link) {
        this.outputLinks.push(link);
    }
}

class Link {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.weight = 0;
    }
}

class Layer {
    constructor(numberOfNodes) {
        this.nodes = [];
        this.init(numberOfNodes);
    }
    init(numberOfNodes) {
        for (let i = 0; i < numberOfNodes; i++) {
            const node = new Node();
            this.nodes.push(node);
        }
    }
}

class Network {
    constructor(params = {}) {
        this.links = [];
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
    static createInstance(params) {
        return new Network(params);
    }
    initiateNeuralNetwork() {
        for (let i = 0; i < this.links.length; i++) {
            this.links[i].weight = ToolBox.lerp(this.minWeightValue, this.maxWeightValue, Math.random());
        }

        for (let i = 1; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].nodes.length; j++) {
                this.layers[i].nodes[j].bias = ToolBox.lerp(this.minBiasValue, this.maxBiasValue, Math.random());
                this.layers[i].nodes[j].n = ToolBox.lerp(this.minNValue, this.maxNValue, Math.random());
            }
        }
    }
    createLayers(numberOfLayers) {
        this.layers = numberOfLayers.map((length) => {
            const layer = new Layer(length);
            return layer;
        });
    }
    connectLayers() {
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer];
            const prevLayer = this.layers[layer - 1];
            for (let node = 0; node < prevLayer.nodes.length; node++) {
                for (let nodeInThisLayer = 0; nodeInThisLayer < thisLayer.nodes.length; nodeInThisLayer++) {
                    const link = new Link(prevLayer.nodes[node], thisLayer.nodes[nodeInThisLayer]);
                    prevLayer.nodes[node].addOutputLink(link);
                    thisLayer.nodes[nodeInThisLayer].addInputLink(link);
                    this.links.push(link);
                }
            }
        }
    }
    setInput(values) {
        this.layers[0].nodes.forEach((node, i) => {
            node.output = values[i];
        });
    }
    getInputs() {
        return this.layers[0].nodes.map(node => node.output);
    }
    getOutput() {
        return this.layers[this.layers.length - 1].nodes.map(node => node.output);
    }
    run() {
        for (let layer = 1; layer < this.layers.length; layer++) {
            const thisLayer = this.layers[layer];
            const prevLayer = this.layers[layer - 1];
            for (let node = 0; node < thisLayer.nodes.length; node++) {
                const thisNode = thisLayer.nodes[node];
                let sum = 0;
                for (let nodeInPrevLayer = 0; nodeInPrevLayer < prevLayer.nodes.length; nodeInPrevLayer++) {
                    const prevNode = prevLayer.nodes[nodeInPrevLayer];
                    for (let link = 0; link < prevNode.outputLinks.length; link++) {
                        const thisLink = prevNode.outputLinks[link];
                        if (thisLink.to === thisNode) {
                            sum += prevNode.output * thisLink.weight;
                        }
                    }
                }
                sum += thisNode.bias;
                thisNode.input = sum;
                thisNode.output = this.params.activation.func(sum, { n: thisNode.n });
            }
        }
    }
}

export { Network };