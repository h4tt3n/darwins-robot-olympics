"use strict";

// ******************************************************
//   Neural network engine version 0.3
//
// Json nn init params structure example:
//
// let nnParams = {
//     nodeLayers : [
//         {
//             label : "input",
//             numNodes : 8,
//             activation : {
//                 func : ActivationFunctions.parameterizedIdentity,
//                 param : { min : -1000, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -10000, max : 10000 }
//         },
//         {
//             label : "hidden",
//             numNodes : 16,
//             activation : {
//                 func : ActivationFunctions.parameterizedIdentity,
//                 param : { min : 0, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -10000, max : 10000 }
//         },
//         {
//             label : "output",
//             numNodes : 8,
//             activation : {
//                 func : ActivationFunctions.parameterizedSoftSign,
//                 param : { min : 0, max : 1000 }
//             },
//             bias : { min : -100, max : 100 },
//             weight : { min : -100, max : 100 }
//         },
//     ],
//     linkLayers : [
//         {
//             label : "hidden-internal",
//             from : "hidden",
//             to : "hidden",
//             connectivity : 1.0
//         },
//         {
//             label : "output-internal",
//             from : "output",
//             to : "output",
//             connectivity : 0.5
//         },
//         {
//             label : "input-hidden",
//             from : "input",
//             to : "hidden",
//             connectivity : 0.5
//         },
//         {
//             label : "hidden-output",
//             from : "hidden",
//             to : "output",
//             connectivity : 0.5
//         }
//     ]
// };
//
// ******************************************************

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { ActivationFunctions } from "./activation-functions.js";

class Node {
    constructor() {
        this.bias = null;
        this.activationParam = null;
        this.input = null;
        this.output = null;
    }
}

class Link {
    constructor() {
        this.weight = null;
        this.inputNode = null;
        this.outputNode = null;
    }
}

class NodeLayer {
    constructor() {
        this.label = null;
        this.nodes = [];
    }
    nodeAngle(node) {
        let index = this.nodes.indexOf(node);
        let numNodes = this.nodes.length;
        return 2 * Math.PI * (index / numNodes);
    }
}

class LinkLayer {
    constructor() {
        this.label = null;
        this.links = [];
    }
}

class NeuralNetwork {
    constructor(params) {
        this.params = params;
        this.label = null;
        this.nodeLayers = [];
        this.linkLayers = [];
    }
    init() {

        this.label = this.params.label;

        // Create node layers
        let numNodeLayers = this.params.nodeLayers.length;
        for (let i = 0; i < numNodeLayers; i++) {
            let layer = new NodeLayer();
            layer.label = this.params.nodeLayers[i].label;
            this.nodeLayers.push(layer);
        }

        // Create nodes
        for (let i = 0; i < numNodeLayers; i++) {
            let numNodes = this.params.nodeLayers[i].numNodes;

            for (let j = 0; j < numNodes; j++) {
                let node = new Node();
                node.bias = ToolBox.randomFloatBetween(this.params.nodeLayers[i].bias.min, this.params.nodeLayers[i].bias.max);
                node.activationParam = ToolBox.randomFloatBetween(this.params.nodeLayers[i].activation.param.min, this.params.nodeLayers[i].activation.param.max);
                this.nodeLayers[i].nodes.push(node);
            }
        }

        // Create link layers
        let numLinkLayers = this.params.linkLayers.length;
        for (let i = 0; i < numLinkLayers; i++) {
            let layer = new LinkLayer();
            layer.label = this.params.linkLayers[i].label;
            this.linkLayers.push(layer);
        }

        // Create links
        for (let i = 0; i < numLinkLayers; i++) {
            
            let fromNodeLayerLabel = this.params.linkLayers[i].from;
            let toNodeLayerLabel = this.params.linkLayers[i].to;
            let connectivity = ToolBox.clamp(this.params.linkLayers[i].connectivity, 0, 1);

            let fromNodeLayer = this.nodeLayers.find(layer => layer.label === fromNodeLayerLabel);
            let toNodeLayer = this.nodeLayers.find(layer => layer.label === toNodeLayerLabel);

            let numLinksPerNode = Math.max(1, Math.round(connectivity * toNodeLayer.nodes.length) - 1);

            //console.log("numLinksPerNode: " + numLinksPerNode);

            for (let j = 0; j < fromNodeLayer.nodes.length; j++) {
                let nodeA = fromNodeLayer.nodes[j];
                let nodeB = fromNodeLayer.nodes[j % toNodeLayer.nodes.length - 1];

                // console.log(fromNodeLayer.nodeAngle(nodeA));
                // console.log(toNodeLayer.nodeAngle(nodeB));
                let angle = ToolBox.angleDifference(fromNodeLayer.nodeAngle(nodeA), toNodeLayer.nodeAngle(nodeB));
                let angleCapped = ToolBox.round(angle, 8);
                console.log(angleCapped);
            }   
        }
    }
}

export { NeuralNetwork };