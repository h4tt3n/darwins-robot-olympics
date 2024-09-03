"use strict";

import { ToolBox } from "../../toolbox/version-01/toolbox.js";
import { ActivationFunctions } from "./activation-functions.js";
import { NeuralNetwork } from "./neural-network.js";

let nnParams = {
    label : "Partially connected, circular feedforward neural network",
    nodeLayers : [
        {
            label : "input",
            numNodes : 16,
            activation : {
                func : ActivationFunctions.parameterizedIdentity,
                param : { min : -1000, max : 1000 }
            },
            bias : { min : -100, max : 100 }
        },
        {
            label : "hidden",
            numNodes : 8,
            activation : {
                func : ActivationFunctions.parameterizedIdentity,
                param : { min : 0, max : 1000 }
            },
            bias : { min : -100, max : 100 }
        },
        {
            label : "output",
            numNodes : 16,
            activation : {
                func : ActivationFunctions.parameterizedSoftSign,
                param : { min : 0, max : 1000 }
            },
            bias : { min : -100, max : 100 }
        },
    ],
    linkLayers : [
        {
            label : "input-internal",
            from : "input",
            to : "input",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
        {
            label : "hidden-internal",
            from : "hidden",
            to : "hidden",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
        {
            label : "output-internal",
            from : "output",
            to : "output",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
        {
            label : "input-hidden",
            from : "input",
            to : "hidden",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
        {
            label : "hidden-output",
            from : "hidden",
            to : "output",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
        {
            label : "output-input",
            from : "output",
            to : "input",
            weight : { min : -100, max : 100 },
            connectivity : 1,
        },
    ]
};

let nn = new NeuralNetwork(nnParams);

nn.init();

console.log(nn);
