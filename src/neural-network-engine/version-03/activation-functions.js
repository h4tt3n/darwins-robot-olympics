"use strict";

// ******************************************************
//   Neural network activation function library
//
// ******************************************************

class ActivationFunctions {

    //  Binary step / Heaviside step function
    static heaviside(x) {
        return x >= 0 ? 1 : 0;
    }

    // Linear activation function / identity function
    static identity(x) {
        return x;
    }

    static parameterizedIdentity(x, lambda = 1) {
        return lambda * x;
    }

    // Sigmoid static / Logistic function
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Hyperbolic tangent / tanh
    static tanh(x) {
        return Math.tanh(x);
    }

    static softSign(x) {
        return x / (1 + Math.abs(x));
    }

    static parameterizedSoftSign(x, lambda = 1) {
        return x / (lambda + Math.abs(x));
    }

    static sin(x) {
        return Math.sin(x);
    }

    static cos(x) {
        return Math.cos(x);
    }

    static tan(x) {
        return Math.tan(x);
    }
}

export { ActivationFunctions };