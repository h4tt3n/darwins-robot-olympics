
import { ToolBox } from "../../../toolbox/version-01/toolbox.js";
import { Phrase } from "../../../entities/phrase/version-01/phrase.js";
import { Individual, GeneticAlgorithm, GeneticOperators } from "../../../genetic-algorithm-engine/version-01/genetic-algorithm.js"

// const target_phrase = "To be or not to be.";

const num_individuals = 1000;
const fitness_threshold = 0.009;
const max_generations = 500;

const gaParams = {

    // Genetic algorithm parameters
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.

    // Genetic operators
    // Select individuals for mating.
    selection : {
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 5,
        },
    }, 
    // Mate individuals.
    crossover : {
        func : GeneticOperators.uniformCrossover,
        params : {
            numChildren : 1,
        },
    }, 
    // Mutate individuals.
    mutation : {
        func : GeneticOperators.randomizeMutation,
        params : {
            mutationChance : 0.01, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

const ga = new GeneticAlgorithm(gaParams);

// Run the algorithm.
let isFinished = false;
let generation = 0;

// Create phrases of individuals
let phrases = [];
let deadPhrases = [];

for (let i = 0; i < num_individuals; i++) {
    let phrase = new Phrase();
    phrases.push(phrase);
}

//console.log(phrases);

// Sort phrases by fitness
//phrases.sort( (a, b) => a.fitness - b.fitness );

// Main loop
while(!isFinished) {

    generation++

    // Evaluate fitness of phrases
    for (let i = 0; i < phrases.length; i++) {
        phrases[i].calculateFitness();
        deadPhrases.push(phrases[i]);
    }

    phrases = [];

    let deadIndividuals = [];

    for (let i = 0; i < deadPhrases.length; i++) {
        let genome = deadPhrases[i].genome;
        let fitness = deadPhrases[i].fitness;
        let individual = new Individual(genome, fitness);
        deadIndividuals.push(individual);
    }

    let newIndividuals = ga.step(deadIndividuals);

    for (let i = 0; i < newIndividuals.length; i++) {
        let phrase = new Phrase();
        phrase.setGenome(newIndividuals[i].genome);
        phrase.calculateFitness();
        phrases.push(phrase);
    }
    
    deadPhrases = [];

    console.log("Generation: " + generation + " - Best phrase: " + phrases[0].value + " - Best phrase fitness: " + phrases[0].fitness + "/" + phrases[0].value.length);

    if (phrases[0].fitness <= fitness_threshold || generation >= max_generations) {
        isFinished = true;
    }
}
