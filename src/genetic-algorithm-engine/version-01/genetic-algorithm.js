"use strict";

/*
 * Copyright (c) 2023 Michael Schmidt Nissen, darwinsrobotolympics@gmail.com
 *
 * All rights reserved.
 *
 * This software and associated documentation files (the "Software"), and the
 * use or other dealings in the Software, are restricted and require the
 * express written consent of the copyright owner. 
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability, 
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other 
 * liability, whether in an action of contract, tort or otherwise, arising 
 * from, out of or in connection with the Software or the use or other 
 * dealings in the Software.
 */

// ******************************************************
//   Genetic algorithm library version 0.1
//   
// ******************************************************

// TODO:
// Function to validate all params and provide meaningful errors before run.
// Add diversifying function, that add genomes filling out holes with missing genome values in the population.
// Add selection based on mutual "attraction" betweeen the most different genomes, to avoid "inbreeding" or premature convergence.
// Expand genetic operator library.
// Getter and setter functions for genetic algorithm parameters?
// Add encode / decode functions to genetic algorithm itself.

import { ToolBox } from "../../toolbox/version-01/toolbox.js";

class Individual {
    constructor(genome = [], fitness = null) {
        this.genome = genome;
        this.fitness = fitness;
    }
}

class GeneticAlgorithm {
    constructor(params = {}) {
        this.params = params;
    }
    step(population) {

        this.elitismNum = Math.floor(population.length * this.params.elitismRate);
        this.gemmationNum = Math.floor(population.length * this.params.gemmationRate);
        this.offspringNum = Math.floor(population.length - (this.elitismNum + this.gemmationNum));

        let nextPopulation = [];

        // Verify population
        let valid = population.every((individual) => {
            return individual instanceof Individual;
        });

        if (!valid) {
            throw new Error("Population must be an array of Individual class instances.");
        }

        // Sort population by fitness (ascending)
        population.sort((a, b) => a.fitness - b.fitness);

        // Elitism (Cloning) without mutation
        for (let i = 0; i < this.elitismNum; i++) {
            nextPopulation.push(population[i]);
        }

        // Asexual reproduction (Gemmation) with mutation 
        for (let i = 0; i < this.gemmationNum; i++) {
            let individualGenes = this.params.selection.func(population, this.params.selection.params);
            this.params.mutation.func(individualGenes, this.params.mutation.params);
            for (let j = 0; j < individualGenes.length; j++) {
                let individual = new Individual(individualGenes[j]);
                nextPopulation.push(individual);
            }
        }

        // Sexual reproduction (Crossover) with mutation 
        //for (let i = 0; i < this.offspringNum; i++) {
        while (nextPopulation.length < population.length) {
            let parentGenes = this.params.selection.func(population, this.params.selection.params);
            let offspringGenes = this.params.crossover.func(parentGenes, this.params.crossover.params);
            this.params.mutation.func(offspringGenes, this.params.mutation.params);
            for (let j = 0; j < offspringGenes.length; j++) {
                let offspring = new Individual(offspringGenes[j]);
                if (nextPopulation.length < population.length) {
                    nextPopulation.push(offspring);
                } else {
                    break;
                }
            }
        }

        return nextPopulation;
    }
}


// ******************************************************
//   Genetic operators
//   
//   Parent selection, Crossover, and Mutation functions
// ******************************************************

class GeneticOperators {

    // ******************************************************
    //   Parent selection functions
    // ******************************************************

    static randomWayTournamentSelection(population = [], config = {}) {
        let numParents = config.numParents;
        let maxContestants = config.maxContestants;

        let parentGenes = [];
        for (let i = 0; i < numParents; i++) {
            let numContestants = maxContestants || population.length < population.length ? maxContestants : population.length;
            let tournamentSize = ToolBox.randomIntBetween(2, numContestants);
            let tournament = [];
            for (let j = 0; j < tournamentSize; j++) {
                let index = ToolBox.randomIntBetween(0, population.length - 1);
                tournament.push(population[index]);
            }
            tournament.sort((a, b) => a.fitness - b.fitness);
            parentGenes.push(tournament[0].genome);
        }
        return parentGenes;
    }

    static rouletteWheelSelection(population = [], config = {}) {
        let numParents = config.numParents;
        let parentGenes = [];
        let sum = population.reduce((acc, individual) => acc + individual.fitness, 0);
        for (let individual of population) {
            individual.prob = individual.fitness / sum;
        }
        for (let i = 0; i < numParents; i++) {
            let randomProb = Math.random();
            let cumulativeProb = 0;
            for (let individual of population) {
                cumulativeProb += individual.prob;
                if (randomProb <= cumulativeProb) {
                    parentGenes.push(individual.genome);
                    break;
                }
            }
        }
        return parentGenes;
    }

    static stochasticUniversalSampling(population = [], config = {}) {
        let numParents = config.numParents;
        let parentGenes = [];
        let sum = population.reduce((acc, individual) => acc + individual.fitness, 0);
        let pointerDistance = sum / numParents;
        let startPoint = Math.random() * pointerDistance;
        let pointers = Array.from({ length: numParents }, (_, i) => startPoint + i * pointerDistance);
        for (let pointer of pointers) {
            let cumulativeSum = 0;
            for (let i = 0; i < population.length; i++) {
                cumulativeSum += population[i].fitness;
                if (cumulativeSum >= pointer) {
                    parentGenes.push(population[i].genome);
                    break;
                }
            }
        }
        return parentGenes;
    }

    static nWayTournamentSelection(population = [], config = {}) {
        let numParents = config.numParents;
        let tournamentSize = config.tournamentSize;
        let parentGenes = [];
        for (let i = 0; i < numParents; i++) {
            let tournament = [];
            for (let j = 0; j < tournamentSize; j++) {
                let randomIndex = ToolBox.randomIntBetween(0, population.length - 1);
                tournament.push(population[randomIndex]);
            }
            tournament.sort((a, b) => a.fitness - b.fitness);
            parentGenes.push(tournament[0].genome);
        }
        return parentGenes;
    }

    static truncationSelection(population = [], config = {}) {
        let numParents = config.numParents;
        let matingNum = config.matingNum || Math.floor(population.length * 0.5);
        let parentGenes = [];
        population.sort((a, b) => a.fitness - b.fitness);
        for (let i = 0; i < numParents; i++) {
            let rnd = ToolBox.randomIntBetween(0, matingNum);
            let individual = population[rnd];
            parentGenes.push(individual.genome);
        }
        return parentGenes;
    }

    static randomSelection(population = [], config = {}) {
        let numParents = config.numParents;
        let parentGenes = [];
        for (let i = 0; i < numParents; i++) {
            let randomIndex = ToolBox.randomIntBetween(0, population.length - 1);
            let individual = population[randomIndex];
            parentGenes.push(individual.genome);
        }
        return parentGenes;
    }


    // ******************************************************
    //   Crossover statics
    // ******************************************************

    static uniformCrossover(parentGenes = [], params = {}) {
        let numChildren = params.numChildren;
        // Check if all parents have the same number of genes
        const geneLength = parentGenes[0].length;
        for (let i = 1; i < parentGenes.length; i++) {
            if (parentGenes[i].length !== geneLength) {
                throw new Error("All parents must have the same number of genes");
            }
        }

        // Randomly select genes from any parent.
        // Selected genes keep their original order and position.
        let offspringGenes = [];
        for (let i = 0; i < numChildren; i++) {
            let newGenes = [];
            for (let j = 0; j < geneLength; j++) {
                let parentGeneIndex = Math.floor(Math.random() * parentGenes.length);
                newGenes.push(parentGenes[parentGeneIndex][j]);
            }
            offspringGenes.push(newGenes);
        }
        return offspringGenes;
    }

    static wholeArithmeticRecombination(parentGenes = [], params = {}) {
        // Only used with genomes encoded as floating point numbers.
        let numChildren = params.numChildren;

        // Check if all parents have the same number of genes
        const geneLength = parentGenes[0].length;
        for (let i = 1; i < parentGenes.length; i++) {
            if (parentGenes[i].length !== geneLength) {
                throw new Error("All parents must have the same number of genes");
            }
        }

        // Randomly weighted linear interpolation between two randomly selected parent genes.
        let offspringGenes = [];
        for (let i = 0; i < numChildren; i++) {
            let newGenes = [];
            for (let j = 0; j < geneLength; j++) {
                let parentIndices = [];
                while (parentIndices.length < 2) {
                    let randomIndex = Math.floor(Math.random() * parentGenes.length);
                    if (!parentIndices.includes(randomIndex)) {
                        parentIndices.push(randomIndex);
                    }
                }
                let gene = ToolBox.lerp(parentGenes[parentIndices[0]][j], parentGenes[parentIndices[1]][j], Math.random());
                newGenes.push(gene);
            }
            offspringGenes.push(newGenes);
        }
        return offspringGenes;
    }


    // ******************************************************
    //   Mutation functions
    // ******************************************************

    static randomizeMutation(genes = [], params = {}) {
        let mutationChance = params.mutationChance;
        let minValue = params.minValue;
        let maxValue = params.maxValue;
        for (let i = 0; i < genes.length; i++) {
            let gene = genes[i];
            for (let i = 0; i < gene.length; i++) {
                if (Math.random() < mutationChance) {
                    gene[i] = ToolBox.randomFloatBetween(minValue, maxValue);
                }
            }
        }
    }

    static swapMutation(genes = [], params = {}) {
        let mutationChance = params.mutationChance;
        let numSwaps = params.numSwaps || randomIntBetween(1, genes.length);
        for (let i = 0; i < genes.length; i++) {
            let gene = genes[i];
            for (let i = 0; i < numSwaps; i++) {
                if (Math.random() < mutationChance) {
                    let indexA = ToolBox.randomIntBetween(0, gene.length - 1);
                    let indexB = ToolBox.randomIntBetween(0, gene.length - 1);
                    let temp = gene[indexA];
                    gene[indexA] = gene[indexB];
                    gene[indexB] = temp;
                }
            }
        }
    }

    static scambleMutation(genes = [], params = {}) {
        // Randomly shuffle the order of genes
        fisherYatesShuffle(genes);
    }

    static inversionMutation(genes = [], params = {}) {
        // Inverse gene order in a random chunk of genes
        let start = ToolBox.randomIntBetween(0, genes.length - 1);
        let end = ToolBox.randomIntBetween(0, genes.length - 1);
        if (start > end) {
            let temp = start;
            start = end;
            end = temp;
        }
        let chunk = genes.slice(start, end);
        chunk.reverse();
        genes.splice(start, end - start, ...chunk);
    }
}

export { GeneticAlgorithm, Individual, GeneticOperators };