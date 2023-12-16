"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { ActivationFunctions } from "../../neural-network-engine/version-01/neural-network.js";
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../simulation-engine/version-05/simulationEngine.js';

const numRobots = 50;

// Neural network parameters
const nnParams = {
	layers : [7, 24, 8], // Number of neurons in each layer: [input, hidden1, (hidden2, ...) output]
	activation : {
		//func : ActivationFunctions.sigmoidLike2,
		func : ActivationFunctions.tanhLike2,
	},
}

//Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 10,
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
            mutationChance : 0.02, 
            minValue : 0, 
            maxValue : 1
        },
    },
};

// Robot parameters
const robotParams = {
    body : {
        position : new Vector2(0, 200),
        numSegments : 10,
        radius : 14,
        mass : 2,
    },
    brain : {
        genome : null, // genome ? genome[i].genome : null,
        params : nnParams
    },
    eyes : {
        position : new Vector2(0, 200),
        direction : Math.PI * 2 * 0,
        numRays : 7,
        fov : Math.PI * 2 * 0.625, // For roboCrabs // Math.PI * 2 * 0.25, // For roboWorms
    }
}

// Simulation parameters
const simParams = {
    gaParams : gaParams,
}

const createRobotFuncs = {
    "RoboWorm" : createRoboWorms,
    "RoboCrab" : createRoboCrabs,
}

let createRobotFunc = createRobotFuncs["RoboWorm"];

// Create simulation
const simulation = new SimulationEngine.Simulation(simParams);

simulation.robotSpawner = {
    func : createRobotFunc, //createRoboCrabs, //createRoboWorms,
    numRobots : numRobots,
    robotParams : robotParams,
    genome : null,
}

// Create menu and eventlisteners
createMenu();

// Create challenge
// createWorld();
// const target = simulation.createWaypoint(new Vector2(2000, 200), 70, "black");
let target = null;
// // Create robots
// //createRoboWorms(numRobots, robotParams, null);
// simulation.robotSpawner.func(simulation.robotSpawner.numRobots, simulation.robotSpawner.robotParams, simulation.robotSpawner.genome);

//simulation.isInitiated = false;

function startSimulation() {
    // if (simulation.isInitiated) { return; }
    // simulation.isInitiated = true;
    // Create challenge
    createWorld();
    target = simulation.createWaypoint(new Vector2(2000, 200), 70, "black");
    // Create robots
    //createRoboWorms(numRobots, robotParams, null);
    simulation.robotSpawner.func(simulation.robotSpawner.numRobots, simulation.robotSpawner.robotParams, simulation.robotSpawner.genome);
    // Run simulation
    //setInterval(update, 1000/60);  // Physics
    setInterval(update, 0);  // Physics
    window.requestAnimationFrame(render); // Rendering
}

function stopSimulation() {
    // if (!simulation.isInitiated) { return; }

    // simulation.isInitiated = false;
    // simulation.isPaused = false;
    // simulation.roboWorms = [];
    // simulation.deadRoboWorms = [];
    // simulation.world.collisions = new Map();
    // simulation.generationTicks = 0;
    // simulation.generation = 0;
    // simulation.selectedCreature = null;
    // simulation.followSelectedCreature = false;
    // simulation.renderer.camera.restPosition = new Vector2(0, 0);
    // simulation.renderer.camera.restZoom = 0.7;
    // deleteRoboWorms();
    // simulation.deadRoboWorms = [];
    // deleteWorld();

    // deleteInterval(update);
    // deleteAnimationFrame(render);
}


// Run simulation
//setInterval(update, 1000/60);  // Physics
// setInterval(update, 0);  // Physics
// window.requestAnimationFrame(render); // Rendering

function render() {
    simulation.renderer.draw();
    window.requestAnimationFrame(render);
}

function update() {
    // Update simulation, except if paused
    if (simulation.isPaused) { return; }
    simulation.generationTicks++;
    simulation.roboWorms.forEach(w => { w.update(); });
    simulation.roboCrabs.forEach(c => { c.update(); });
    simulation.update();
    //simulation.evaluate();
    evaluate();
}

function evaluate() {
    
    // Check if robot has completed challenge, using challenge-specific functions
    for (let i = 0; i < simulation.roboWorms.length; i++) {
        
        let robot = simulation.roboWorms[i];
        
        if (creatureTimeouts(robot, 1000) || hasReachedTarget(robot, target)) {
            calculateFitness(robot, target);
            console.log("fitness " + robot.fitness);
            simulation.deleteRoboWorm(robot);
        } else {
            robot.ticksAlive++;
        }
    }

    // When all robots are disabled, create new generation
    if (simulation.roboWorms.length === 0) {

        console.log("\n");
        console.log("generation " + simulation.generation + " completed!");
        console.log("\n");
        
        // Run genetic algorithm
        simulation.runGeneticAlgorithm();
        
        // Create new robots
        simulation.robotSpawner.func(simulation.robotSpawner.numRobots, simulation.robotSpawner.robotParams, simulation.individuals);
        
        // Reset simulation
        simulation.deadRoboWorms = [];
        simulation.world.collisions = new Map();
        simulation.generationTicks = 0;
        simulation.generation++;
    }
}

function distanceToTarget(creature, target) {
    let position = creature.body.particles[0].position;
    let distance = position.distance(target.position);
    return distance;
}

function hasReachedTarget(creature, target) {
    let distance = distanceToTarget(creature, target);
    if (distance < target.radius + creature.body.particles[0].radius) {
        return true;
    } else {
        return false;
    }
}

function calculateFitness(creature, target) {
    let fitness = 0;
    fitness += distanceToTarget(creature, target);
    fitness += creature.ticksAlive;
    if (hasReachedTarget(creature, target)) {
        fitness *= 0.5;
    }
    creature.fitness = fitness;
}

function creatureTimeouts(creature, timeout) {
    return (creature.ticksAlive > timeout);
}

function createRoboWorms(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        params.body.position = new Vector2(0, 200);
        params.brain.genome = genome ? genome[i].genome : null;
        simulation.createRobWorm(params);
    }
}

function deleteRoboWorms() {
    for (let i = 0; i < simulation.roboWorms; i++) {
        simulation.deleteRoboWorm(simulation.roboWorms[i]);
    }
}

function createRoboCrabs(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        params.body.position = new Vector2(0, 200);
        params.brain.genome = genome ? genome[i].genome : null;
        simulation.createRoboCrab(params);
    }
}

function createWorld() {
    // Params
    let top = -400;
    let bottom = 400;
    let left = -400;
    let right = 3600;
    let numSegments = 8;
    let segmentWidth = (right-left) / numSegments;
    let segmentBaseHeight = bottom + 100;
    let segmentRandomization = 25;

    let bottomPoints = [];

    // Create world
    let topLeftPoint = simulation.world.createPoint(new Vector2(left, top));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, top));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, bottom));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, bottom));

    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(topLeftPoint, bottomLeftPoint);

    let p1 = bottomLeftPoint;

    for (let i = 0; i < numSegments-1; i++) {
        let height = segmentBaseHeight + (Math.random() * segmentRandomization * 2 - segmentRandomization);
        let p2 = simulation.world.createPoint(new Vector2(left + segmentWidth * (i + 1), height));
        bottomPoints.push(simulation.world.createLineSegment(p1, p2));
        p1 = p2;
    }

    bottomPoints.push(simulation.world.createLineSegment(p1, bottomRightPoint));
};

function deleteWorld() {
    simulation.world.lineSegments = [];
    simulation.world.points = [];
}

function createMenu() {
    // Create menu
    const menu = document.createElement('div');

    // Set the position to absolute and the bottom to 0
    menu.style.position = 'absolute';
    menu.style.bottom = '0';

    // Set a background color for visibility
    menu.style.backgroundColor = 'rgb(160, 160, 160)';

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


    // Toggle raycasting button

    // Create a new button element
    var button = document.createElement('button');
    button.textContent = 'Toggle Raycast rendering';

    // Add an onclick event handler to the button
    button.onclick = function() {
    // Toggle the renderRaycasts variable
    simulation.renderRaycasts = !simulation.renderRaycasts;
    console.log("renderRaycasts: " + simulation.renderRaycasts);
    };

    // Append the button to the menu div
    menu.appendChild(button);

    // Mouse zoom
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


    // Pause button

    var pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause';

    // Add an onclick event handler to the button
    pauseButton.onclick = function() {
        // Toggle the renderRaycasts variable
        simulation.isPaused = !simulation.isPaused;
        console.log("paused: " + simulation.isPaused);
    }

    // Append the button to the menu div
    menu.appendChild(pauseButton);

    // Start / Stop simulation button

    // var startStopButton = document.createElement('button');
    // simulation.isInitiated = false;
    // startStopButton.textContent = 'Start simulation';

    // // Add an onclick event handler to the button
    // startStopButton.onclick = function() {
    //     // Toggle the renderRaycasts variable
    //     if (simulation.isInitiated) {
    //         startStopButton.textContent = 'Stop simulation';
    //         stopSimulation();
    //     } else {
    //         startStopButton.textContent = 'Start simulation';
    //         startSimulation();
    //     }
    //     simulation.isInitiated = !simulation.isInitiated;
    // }

    // // Append the button to the menu div
    // menu.appendChild(startStopButton);


    // Start simulation button

    var startButton = document.createElement('button');
    startButton.textContent = 'Start simulation';

    // Add an onclick event handler to the button
    startButton.onclick = function() {
        // Toggle the renderRaycasts variable
        if(simulation.isInitiated) { return; }
        startSimulation();
        console.log("starting simulation");
        //startButton.textContent = 'Stop simulation';
        simulation.isInitiated = !simulation.isInitiated;
    }

    // Append the button to the menu div
    menu.appendChild(startButton);


    // robot selection drop-down menu, based on createRobotFuncs

    // Create a new select element
    var select = document.createElement('select');

    // Loop through all the createRobot functions
    for (var createRobotFuncName in createRobotFuncs) {
        // Create a new option element
        var option = document.createElement('option');
        // Set the option element's value to the name of the createRobot function
        option.value = createRobotFuncName;
        // Set the option element's text content to the name of the createRobot function
        option.textContent = createRobotFuncName;
        // Append the option element to the select element
        select.appendChild(option);
    }

    // Add an onchange event handler to the select element
    select.onchange = function() {
        // Get the selected value
        var selectedValue = select.value;
        // Get the createRobot function for the selected robot
        createRobotFunc = createRobotFuncs[selectedValue];
        // Set the createRobot function as the robotSpawner function
        simulation.robotSpawner.func = createRobotFunc;
        // Reset the simulation
        // stopSimulation();
        // startSimulation();
    };

    // Append the select element to the menu div
    menu.appendChild(select);

    // Mouse pan

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


    // Mouse select nearest creature

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
        var smallestDistance = 50;
       
        // Loop through all the roboWorms
        simulation.roboWorms.forEach((robot) => {
           // Create a Vector2 for the robot's position
           var roboWormPos = new Vector2(robot.body.particles[0].position.x, robot.body.particles[0].position.y);
       
           // Calculate the distance to the robot
           var distance = mousePos.distance(roboWormPos);
       
           // If the distance is smaller than the smallest distance found so far, update the smallest distance and the nearest creature
           if (distance < smallestDistance) {
              smallestDistance = distance;
              nearestCreature = robot;
           }
        });
       
        // If a creature was found, set the selectedCreature variable
        if (nearestCreature !== null) {
            simulation.selectedCreature = nearestCreature;
            simulation.followSelectedCreature = false; //true;
            console.log({selectedCreature: simulation.selectedCreature});
        } else {
            simulation.selectedCreature = null;
            simulation.followSelectedCreature = false;
            console.log({selectedCreature: simulation.selectedCreature});
        }
    });

    return menu;
}