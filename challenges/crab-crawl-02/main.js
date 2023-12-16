"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../simulation-engine/version-05/simulationEngine.js';
import { Factory } from '../../simulation-engine/version-05/factory.js';

const nnParams = {
	layers : [7, 16, 8], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

//Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.10,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 5,
        },
    }, 
    crossover : { // Mate individuals.
        func : GeneticOperators.wholeArithmeticRecombination,
        params : {
            numChildren : 1,
        },
    }, 
    mutation : { // Mutate individuals.
        func : GeneticOperators.randomizeMutation,
        params : {
            mutationChance : 0.05, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

// Create simulation
const simulation = new SimulationEngine.Simulation(simParams);



// Create menu
var menu = document.createElement('div');

// Add id to the menu div
menu.id = 'menu';

// Set the position to absolute and the bottom to 0
menu.style.position = 'absolute';
menu.style.bottom = '0';

// Set a background color for visibility
menu.style.backgroundColor = 'rgb(128, 128, 128)';

// Add some text for visibility
//menu.textContent = 'This is the menu';

// Calculate the height and width of the rectangle
var height = window.innerHeight * 0.2;
var width = window.innerWidth;

// Set the height and width of the rectangle
menu.style.height = height + 'px';
menu.style.width = width + 'px';

// Append the new div to the body of the document
document.body.appendChild(menu);

// Create a new button element
var button = document.createElement('button');
button.textContent = 'Toggle Raycasts';

// Add an onclick event handler to the button
button.onclick = function() {
   // Toggle the renderRaycasts variable
   simulation.renderRaycasts = !simulation.renderRaycasts;
   console.log("renderRaycasts: " + simulation.renderRaycasts);
};

// Append the button to the menu div
menu.appendChild(button);


// Listen to the wheel event
simulation.renderer.canvas.addEventListener("wheel", (event) => {
    // Check if the user has scrolled up or down
    if (event.deltaY < 0) {
        // The user has scrolled up, so zoom in
        simulation.renderer.camera.restZoom *= 1.1; //simulation.renderer.camera.deltaZoom;
    } else {
        // The user has scrolled down, so zoom out
        simulation.renderer.camera.restZoom /= 1.1; //simulation.renderer.camera.deltaZoom;
    }
  });

  // Initialize variables
var isDragging = false;
var initialMousePos;
var initialCameraPos;

// Listen to the mousedown event
simulation.renderer.canvas.addEventListener("mousedown", (event) => {
 if (event.button === 0) { // 0 is the left mouse button
   isDragging = true;
   initialMousePos = new Vector2(event.clientX, event.clientY);
   initialCameraPos = new Vector2(simulation.renderer.camera.position.x, simulation.renderer.camera.position.y);
 }
});

// Listen to the mousemove event
simulation.renderer.canvas.addEventListener("mousemove", (event) => {
 if (isDragging) {
   var currentMousePos = new Vector2(event.clientX, event.clientY);
   var deltaMousePos = currentMousePos.sub(initialMousePos);
   deltaMousePos = deltaMousePos.div(simulation.renderer.camera.zoom);
   simulation.renderer.camera.restPosition.x = (initialCameraPos.x - deltaMousePos.x);
   simulation.renderer.camera.restPosition.y = (initialCameraPos.y - deltaMousePos.y);
 }
});

// Listen to the mouseup event
simulation.renderer.canvas.addEventListener("mouseup", (event) => {
 if (event.button === 0) { // 0 is the left mouse button
   isDragging = false;
 }
});

// Listen to the click event
simulation.renderer.canvas.addEventListener("click", (event) => {
    // Get the mouse's position in screen coordinates
    var mouseX = event.clientX;
    var mouseY = event.clientY;
   
    // Convert the mouse's position from screen coordinates to world coordinates
    var worldX = (mouseX - simulation.renderer.canvas.width / 2) / simulation.renderer.camera.zoom + simulation.renderer.camera.position.x;
    var worldY = (mouseY - simulation.renderer.canvas.height / 2) / simulation.renderer.camera.zoom + simulation.renderer.camera.position.y;
   
    // Create a Vector2 for the mouse's position in world coordinates
    var mousePos = new Vector2(worldX, worldY);
   
    // Initialize variables
    var nearestCreature = null;
    var smallestDistance = 100;
   
    // Loop through all the roboCrabs
    simulation.roboCrabs.forEach((roboCrab) => {
       // Create a Vector2 for the roboCrab's position
       var roboCrabPos = new Vector2(roboCrab.body.particles[0].position.x, roboCrab.body.particles[0].position.y);
   
       // Calculate the distance to the roboCrab
       var distance = mousePos.distance(roboCrabPos);
   
       // If the distance is smaller than the smallest distance found so far, update the smallest distance and the nearest creature
       if (distance < smallestDistance) {
          smallestDistance = distance;
          nearestCreature = roboCrab;
       }
    });
   
    // If a creature was found, set the selectedCreature variable
    if (nearestCreature !== null) {
        simulation.selectedCreature = nearestCreature;
        simulation.followSelectedCreature = true;
        console.log({selectedCreature: simulation.selectedCreature});
    } else {
        simulation.selectedCreature = null;
        simulation.followSelectedCreature = false;
        console.log({selectedCreature: simulation.selectedCreature});
    }
});
   

// Select challenge menu
let challenges = {
    "Long jump" : Factory.createWorld,
    "High jump" : Factory.createWorld,
    "Sprinting" : Factory.createWorld,
    "Climbing" : Factory.createWorld,
    "Football" : Factory.createWorld,
    "Ski jump" : Factory.createWorld,
}

// Default challenge
let selectedChallenge = "Sprinting";

// Create the default challenge
challenges[selectedChallenge](simulation);  

// Create a new select element
var select = document.createElement('select');

// Loop through the challenges object and create an option for each property
for (var challenge in challenges) {
   var option = document.createElement('option');
   option.value = challenge;
   option.text = challenge;
   select.appendChild(option);
}

// Add an onchange event handler to the select element
select.onchange = function() {
   // Set the selectedChallenge variable to the selected option
   selectedChallenge = this.value;
   Factory.deleteWorld(simulation);
   challenges[selectedChallenge](simulation);  
};

// Append the select element to the menu div
menu.appendChild(select);


// Creature selection menu
let creatures = {
    "roboCrab" : Factory.createRoboCrab,
    "roboWorm" : Factory.createRobWorm,
}

let selectedCreature = "roboCrab";

var creatureList = document.createElement('select');

// Loop through the creatures object and create an option for each property
for (var creature in creatures) {
    var option = document.createElement('option');
    option.value = creature;
    option.text = creature;
    creatureList.appendChild(option);
 }
 
 // Add an onchange event handler to the creatureList element
 creatureList.onchange = function() {
    // Set the selectedcreature variable to the selected option
    selectedCreature = this.value;
 };
 
 // Append the select element to the menu div
 menu.appendChild(creatureList);
 

 for (let i = 0; i < 50; i++) {
    let randomPosition = new Vector2(-800, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
    let robCrabParams = {
        body : {
            position : randomPosition, //new Vector2(-300, -350),
            // numSegments : 10,
            // radius : 14,
            // mass : 2,
            // color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
        },
        brain : {
            genome : null,
            params : nnParams,
        },
        eyes : {
            position : randomPosition, //
            direction : Math.PI * 2 * 0,
            numRays : 7,
            fov : Math.PI * 2 * 0.625,
        }
    }

    //simulation.createRoboCrab(robCrabParams);
    creatures[selectedCreature](simulation, robCrabParams);  
}


// Run simulation
//setInterval(update, 1000/60);  // Physics
setInterval(update, 0);  // Physics
window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.generationTicks++;
    simulation.roboCrabs.forEach(w => { w.update(); });
    simulation.update();
    evaluate();
}

function evaluate() {
    
    //
    for (let i = 0; i < simulation.roboCrabs.length; i++) {
        let crab = simulation.roboCrabs[i];
        if (simulation.generationTicks > simulation.generationsMaxTicks) {
            crab.calculateFitness();
            console.log("fitness: " + crab.fitness);
            Factory.deleteRoboCrab(simulation, crab);
        } else {
            crab.ticksAlive++;
            //crab.calculateScore();
        }
    }

    //
    if (simulation.roboCrabs.length === 0) {
        
        simulation.deadIndividuals = [];

        for (let i = 0; i < simulation.deadRoboCrabs.length; i++) {
            let individualParams = {
                genome : simulation.deadRoboCrabs[i].brain.encode(),
                fitness : simulation.deadRoboCrabs[i].fitness,
            }
            Factory.createIndividual(simulation, individualParams);
        }

        simulation.individuals = simulation.geneticAlgorithm.step(simulation.deadIndividuals);

        for (let i = 0; i < simulation.individuals.length; i++) {

            let randomPosition = new Vector2(-800, 200); //new Vector2(Math.random() * 300 - 800, Math.random() * 300 - 300)
            let robCrabParams = {
                body : {
                     position : randomPosition, //new Vector2(-300, -350),
                //     numSegments : 10,
                //     radius : 14,
                //     mass : 2,
                //     color : "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ")",
                },
                brain : {
                    genome : simulation.individuals[i].genome,
                    params : nnParams,
                },
                eyes : {
                    position : randomPosition, //
                    direction : Math.PI * 2 * 0,
                    numRays : 7,
                    fov : Math.PI * 2 * 0.625,
                }
            }

            //simulation.createRoboCrab(robCrabParams);
            creatures[selectedCreature](simulation, robCrabParams);  
        }
        
        simulation.deadRoboCrabs = [];

        simulation.world.collisions = new Map();

        simulation.generationTicks = 0;
        simulation.generation++;
    }
}
