"use strict";

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

    static parameterizedIdentity(x, lambda = 1) {
        return lambda * x;
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

export { ActivationFunctions };