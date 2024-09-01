"use strict";

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
            bias : { min : -100, max : 100 },
            weight : { min : -10000, max : 10000 }
        },
        {
            label : "hidden",
            numNodes : 8,
            activation : {
                func : ActivationFunctions.parameterizedIdentity,
                param : { min : 0, max : 1000 }
            },
            bias : { min : -100, max : 100 },
            weight : { min : -10000, max : 10000 }
        },
        {
            label : "output",
            numNodes : 16,
            activation : {
                func : ActivationFunctions.parameterizedSoftSign,
                param : { min : 0, max : 1000 }
            },
            bias : { min : -100, max : 100 },
            weight : { min : -100, max : 100 }
        },
    ],
    linkLayers : [
        {
            label : "input-internal",
            from : "input",
            to : "input",
            connectivity : 8/16
        },
        // {
        //     label : "hidden-internal",
        //     from : "hidden",
        //     to : "hidden",
        //     connectivity : 0.5 * Math.PI * 2,
        // },
        // {
        //     label : "output-internal",
        //     from : "output",
        //     to : "output",
        //     connectivity : 0.5 * Math.PI * 2,
        // },
        // {
        //     label : "input-hidden",
        //     from : "input",
        //     to : "hidden",
        //     connectivity : 0.5 * Math.PI * 2,
        // },
        // {
        //     label : "hidden-output",
        //     from : "hidden",
        //     to : "output",
        //     connectivity : 0.5 * Math.PI * 2,
        // },
        // {
        //     label : "output-input",
        //     from : "output",
        //     to : "input",
        //     connectivity : 0.5 * Math.PI * 2,
        // },
    ]
};

let nn = new NeuralNetwork(nnParams);

nn.init();

console.log(nn);
