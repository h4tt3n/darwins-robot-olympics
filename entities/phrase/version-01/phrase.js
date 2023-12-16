"use strict";

import { ToolBox } from "../../../toolbox/version-01/toolbox.js";

class Phrase {
    constructor(genome) {
        this.fitness = null;
        //this.targetValue = "To be or not to be.";
        this.targetValue = "The quick brown fox jumps over the lazy dog.";
        //this.targetValue = "Insanity is doing the same thing over and over again and expecting different results. Insanity is doing the same thing over and over again and expecting different results. Insanity is doing the same thing over and over again and expecting different results.";
        this.targetGenome = this.encode(this.targetValue);
        if (genome) {
            this.setGenome(genome);
        } else {
            let genome = this.createRandomGenome();
            this.setGenome(genome);
        }
        this.calculateFitness();
    }
    static createInstance(genome) {
        if (genome) {
            return new Phrase(genome);
        } else {
            return new Phrase();
        }
    }
    calculateFitness() {

        // Calculate fitness from genome deviation
        // let fitness = 0;
        // for(let i = 0; i < this.value.length; i++) {
        //     fitness += Math.abs(this.genome[i] - this.targetGenome[i]);
        // }
        // this.fitness = fitness;

        // Calculate fitness from string value deviation
        let fitness = 0;
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i] != this.targetValue[i]) {
                fitness++;
            }
        }
        this.fitness = fitness;
    }
    createRandomGenome() {
        let genome = [];
        for (let i = 0; i < this.targetValue.length; i++) {
            let gene = Math.random();
            genome.push(gene);
        }
        return genome;
    }
    setValue(value) {
        this.value = value;
        this.genome = this.encode(value);
    }
    setGenome(genome) {
        this.genome = genome;
        this.value = this.decode(genome);
    }
    encode(value) {
        // Encode a string value into a genome of floats [0, 1]
        let genome = [];
        for (let i = 0; i < value.length; i++) {
            let gene = ToolBox.map(value.charCodeAt(i), 0, 255, 0, 1);
            //gene = round(gene, 3); // 3 decimals is enough for 255 values
            //gene = Number(gene.toFixed(3));
            genome.push(gene);
        }
        return genome;
        //this.setGenome(genome);
    }
    decode(genome) {
        // Decode a genome of floats [0, 1] into a string value
        let value = "";
        for (let i = 0; i < genome.length; i++) {
            let gene = Math.round(ToolBox.map(genome[i], 0, 1, 0, 255));
            value += String.fromCharCode(gene);
        }
        return value;
        //this.setValue(value);
    }
}

export { Phrase };