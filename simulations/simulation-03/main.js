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


import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { GeneticOperators } from "../../genetic-algorithm-engine/version-01/genetic-algorithm.js";
import { SimulationEngine } from '../../simulation-engine/version-07/simulationEngine.js';

let numRobots = 50;

//Genetic algorithm parameters
const gaParams = {
    gemmationRate : 0.0, // Fraction of next generation created through asexual reproduction.
    elitismRate : 0.1,  // Fraction of fittest individuals that will be cloned to next generation.
    selection : { // Select individuals for mating.
        func : GeneticOperators.randomWayTournamentSelection,
        params : {
            numParents : 2,
            maxContestants : 8,
        },
    }, 
    crossover : { // Mate individuals.
        func : GeneticOperators.wholeArithmeticRecombination,
        params : {
            numChildren : 2,
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

const createRobotFuncs = {
    "RoboWorm" : createRoboWorms,
    "RoboStarfish" : createRoboStarfishes,
    "RoboCar" : createRoboCars,
    "TopDownTracker" : createTrackers,
}

const createChallengeFuncs = { 
    "100-meter Sprint" : createWorld,
    "Long Jump" : createWorld2,
    "Climbing" : createWorld3,
    "Pitfall" : pitFall,
    "Pitfall2" : pitFall2,
    "Helmet" : helmet,
    "Thunder Dome" : thunderDome,
    "Stairway" : createStairwayMap,
}

let createRobotFunc = createRobotFuncs["RoboWorm"];
let createChallengeFunc = createChallengeFuncs["100-meter Sprint"];

// Create simulation
const simulation = new SimulationEngine.Simulation(simParams);

simulation.robotSpawner = {
    func : createRobotFunc,
    numRobots : numRobots,
    //robotParams : robotParams,
    genome : null,
}

simulation.challengeSpawner = {
    func : createChallengeFunc,
}

// Create menu and eventlisteners
createMenu();


let target = null;

simulation.isInitiated = false;

window.requestAnimationFrame(render); // Rendering

function startSimulation() {
    simulation.challengeSpawner.func();
    target = simulation.createWaypoint(new Vector2(2000, 200), 50, "black");
    // Create robots
    //simulation.robotSpawner.func(simulation.robotSpawner.numRobots, simulation.robotSpawner.robotParams, simulation.robotSpawner.genome);
    simulation.robotSpawner.func(simulation.robotSpawner.numRobots, null, simulation.robotSpawner.genome);
    // Run simulation
    simulation.setIntervalId = setInterval(update, 0);
}

function stopSimulation() {
    clearInterval(simulation.setIntervalId);
    simulation.reset();
    deleteWorld();
}

function render() {
    simulation.renderer.update();
    window.requestAnimationFrame(render);
}

function update() {
    simulation.update();
}


// Robot creation functions

function createRoboWorms(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        //params.brain.genome = genome ? genome[i].genome : null;
        //console.log(params);
        let brainGenome = genome ? genome[i].genome : null;
        //simulation.createRoboWorm(params);
        simulation.createRoboWorm(brainGenome);
    }
}

function createRoboStarfishes(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        //params.brain.genome = genome ? genome[i].genome : null;
        let brainGenome = genome ? genome[i].genome : null;
        //simulation.createRoboStarfish(params);
        simulation.createRoboStarfish(brainGenome);
    }
}

function createRoboCars(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        //params.brain.genome = genome ? genome[i].genome : null;
        let brainGenome = genome ? genome[i].genome : null;
        //simulation.createRoboCar(params);
        simulation.createRoboCar(brainGenome);
    }
}

function createTrackers(numRobots = 50, params = {}, genome = null) {
    for (let i = 0; i < numRobots; i++) {
        let brainGenome = genome ? genome[i].genome : null;
        simulation.createRobot(brainGenome);
    }
}


// Level creation functions

function createWorld() {
    // Params
    let top = -400;
    let bottom = 400;
    let left = -400;
    let right = 3600;
    let numSegments = 1;
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

function createWorld2() {
    // Params
    let top = -400;
    let bottom = 400;
    let left = -400;
    let right = 3000;

    // Create world
    let topLeftPoint = simulation.world.createPoint(new Vector2(left, top));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, top));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, bottom + 600));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, bottom));
    let edgeCenterTop = simulation.world.createPoint(new Vector2(1600, bottom ));
    let edgeCenterBtm = simulation.world.createPoint(new Vector2(1600, bottom + 300));

    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(topLeftPoint, bottomLeftPoint);
    simulation.world.createLineSegment(bottomLeftPoint, edgeCenterTop);
    simulation.world.createLineSegment(edgeCenterTop, edgeCenterBtm);
    simulation.world.createLineSegment(edgeCenterBtm, bottomRightPoint);
};

function createWorld3() {
    
    // Params
    let topLeft = 0;
    let topRight = -600;
    let btmLeft = 800;
    let btmRight = 200;
    let left = -800;
    let right = 3000;

    // Create world
    let topLeftPoint = simulation.world.createPoint(new Vector2(left, topLeft));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, topRight));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, btmRight));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, btmLeft));

    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(bottomRightPoint, bottomLeftPoint);
    simulation.world.createLineSegment(bottomLeftPoint, topLeftPoint);
};

function pitFall() {
    // Params
    let top = -800;
    let bottom = 400;
    let left = -1200;
    let right = 2800;
    let pitTopOffset = 200;
    let pitBottomOffset = 200;

    let pitLeft = 600;
    let pitRight = 1000;
    let pitBottom = 3000;

    // Create world
    let topLeftPoint = simulation.world.createPoint(new Vector2(left, top));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, top));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, bottom));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, bottom));
    let pitTopLeftPoint = simulation.world.createPoint(new Vector2(pitLeft, bottom + pitTopOffset));
    let pitBottomLeftPoint = simulation.world.createPoint(new Vector2(pitLeft - pitBottomOffset, pitBottom));
    let pitBottomRightPoint = simulation.world.createPoint(new Vector2(pitRight + pitBottomOffset, pitBottom));
    let pitTopRightPoint = simulation.world.createPoint(new Vector2(pitRight, bottom + pitTopOffset));


    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(topLeftPoint, bottomLeftPoint);
    simulation.world.createLineSegment(bottomLeftPoint, pitTopLeftPoint);
    simulation.world.createLineSegment(pitTopLeftPoint, pitBottomLeftPoint);
    simulation.world.createLineSegment(pitBottomLeftPoint, pitBottomRightPoint);
    simulation.world.createLineSegment(pitBottomRightPoint, pitTopRightPoint);
    simulation.world.createLineSegment(pitTopRightPoint, bottomRightPoint);
};

function pitFall2() {
    // Params
    let top = -400;
    let bottom = 400;
    let left = -800;
    let right = 2400;

    let pitLeft = 700;
    let pitRight = 1000;
    let pitBottom = 2000;

    // Create world
    // let valdesSuperPoint1 = simulation.world.createPoint(new Vector2(450, -150));
    // let valdesSuperPoint2 = simulation.world.createPoint(new Vector2(400, 400));
    // let valdesSuperPoint3 = simulation.world.createPoint(new Vector2(700, -400));
    // let valdesSuperPoint4 = simulation.world.createPoint(new Vector2(750, 150));
    // let valdesSuperPoint5 = simulation.world.createPoint(new Vector2(1100, -150));
    // let valdesSuperPoint6 = simulation.world.createPoint(new Vector2(1000, 400));

    // let segment1 = simulation.world.createLineSegment(valdesSuperPoint1, valdesSuperPoint2);
    // let segment2 = simulation.world.createLineSegment(valdesSuperPoint3, valdesSuperPoint4);
    // let segment3 = simulation.world.createLineSegment(valdesSuperPoint5, valdesSuperPoint6);

    let tunnelPoint1 = simulation.world.createPoint(new Vector2(100, top));
    let tunnelPoint2 = simulation.world.createPoint(new Vector2(100, -200));
    let tunnelPoint3 = simulation.world.createPoint(new Vector2(1500, -200));
    let tunnelPoint4 = simulation.world.createPoint(new Vector2(1500, top));

    let tunnelPoint5 = simulation.world.createPoint(new Vector2(100, bottom));
    let tunnelPoint6 = simulation.world.createPoint(new Vector2(100, 50));
    let tunnelPoint7 = simulation.world.createPoint(new Vector2(1500, 50));
    let tunnelPoint8 = simulation.world.createPoint(new Vector2(1500, bottom));

    let tunnelSegment1 = simulation.world.createLineSegment(tunnelPoint1, tunnelPoint2);
    let tunnelSegment2 = simulation.world.createLineSegment(tunnelPoint2, tunnelPoint3);
    let tunnelSegment3 = simulation.world.createLineSegment(tunnelPoint3, tunnelPoint4);

    let tunnelSegment4 = simulation.world.createLineSegment(tunnelPoint5, tunnelPoint6);
    let tunnelSegment5 = simulation.world.createLineSegment(tunnelPoint6, tunnelPoint7);
    let tunnelSegment6 = simulation.world.createLineSegment(tunnelPoint7, tunnelPoint8);


    //segment.radius = 24;

    let topLeftPoint = simulation.world.createPoint(new Vector2(left, top));
    let topRightPoint = simulation.world.createPoint(new Vector2(right, top));
    let bottomRightPoint = simulation.world.createPoint(new Vector2(right, bottom));
    let bottomLeftPoint = simulation.world.createPoint(new Vector2(left, bottom));
    let pitTopLeftPoint = simulation.world.createPoint(new Vector2(pitLeft, bottom));
    let pitBottomLeftPoint = simulation.world.createPoint(new Vector2(pitLeft - 100, pitBottom));
    let pitBottomRightPoint = simulation.world.createPoint(new Vector2(pitRight + 100, pitBottom));
    let pitTopRightPoint = simulation.world.createPoint(new Vector2(pitRight, bottom));

    simulation.world.createLineSegment(topLeftPoint, topRightPoint);
    simulation.world.createLineSegment(topRightPoint, bottomRightPoint);
    simulation.world.createLineSegment(topLeftPoint, bottomLeftPoint);
    simulation.world.createLineSegment(bottomLeftPoint, pitTopLeftPoint);
    simulation.world.createLineSegment(pitTopLeftPoint, pitBottomLeftPoint);
    simulation.world.createLineSegment(pitBottomLeftPoint, pitBottomRightPoint);
    simulation.world.createLineSegment(pitBottomRightPoint, pitTopRightPoint);
    simulation.world.createLineSegment(pitTopRightPoint, bottomRightPoint);
};

function helmet() {

    // Params
    let levelCenter = new Vector2(1000, 0);
    let levelWidth = 3800;
    let platformWidth = 1500;
    let pitWidth = (levelWidth-2*platformWidth)/3;
    let pitBottomMargin = 100;
    let bottom = 2400;
    let left = levelCenter.x-levelWidth/2;
    
    let pitDepth = 2000;

    let domeRadius = levelWidth/2;
    let domeWidth = domeRadius;
    let domeHeight = domeRadius; //1400;
    let numDomeSegments = 8;
    let domeCenter = new Vector2(1000, -200);
    let firstDomePoint = null;
    let lastDomePoint = null;
    
    // Create dome Points
    for(let i = 0; i < numDomeSegments; i++) {
        let angle = -Math.PI * 1 * (i / (numDomeSegments-1));
        let domePoint = simulation.world.createPoint(domeCenter.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(new Vector2(domeRadius, domeHeight))));
        if (i == 0) {
            firstDomePoint = domePoint;
        }
        if (i == numDomeSegments-1) 
        {
            lastDomePoint = domePoint;
        }
    }

    // Create dome LineSegments
    for(let i = 0; i < numDomeSegments-1; i++) {
        let domePoint1 = simulation.world.points[i];
        let domePoint2 = simulation.world.points[(i + 1)];
        simulation.world.createLineSegment(domePoint1, domePoint2);
    }

    // Leftmost pit point
    let topLeftPoint1 = simulation.world.createPoint(new Vector2(left, bottom - pitDepth));
    let bottomLeftPoint1 = simulation.world.createPoint(new Vector2(left - pitBottomMargin, bottom));
    let bottomRightPoint1 = simulation.world.createPoint(new Vector2(left + pitWidth + pitBottomMargin, bottom));
    let topRightPoint1 = simulation.world.createPoint(new Vector2(left + pitWidth, bottom - pitDepth));

    // Center pit point
    let topLeftPoint2 = simulation.world.createPoint(new Vector2(left + pitWidth + platformWidth, bottom - pitDepth + 100));
    let bottomLeftPoint2 = simulation.world.createPoint(new Vector2(left + pitWidth + platformWidth - pitBottomMargin, bottom));
    let bottomRightPoint2 = simulation.world.createPoint(new Vector2(left + 2 * pitWidth + platformWidth + pitBottomMargin, bottom));
    let topRightPoint2 = simulation.world.createPoint(new Vector2(left + 2 * pitWidth + platformWidth, bottom - pitDepth - 100));
    
    // Rightmost pit point
    let topLeftPoint3 = simulation.world.createPoint(new Vector2(left + 2 * pitWidth + 2 * platformWidth, bottom - pitDepth));
    let bottomLeftPoint3 = simulation.world.createPoint(new Vector2(left + 2 * pitWidth + 2 * platformWidth - pitBottomMargin, bottom));
    let bottomRightPoint3 = simulation.world.createPoint(new Vector2(left + 3 * pitWidth + 2 * platformWidth + pitBottomMargin, bottom));
    let topRightPoint3 = simulation.world.createPoint(new Vector2(left + 3 * pitWidth + 2 * platformWidth, bottom - pitDepth));

    // Leftmost pit lineSegments
    simulation.world.createLineSegment(lastDomePoint, topLeftPoint1);
    simulation.world.createLineSegment(topLeftPoint1, bottomLeftPoint1);
    simulation.world.createLineSegment(bottomLeftPoint1, bottomRightPoint1);
    simulation.world.createLineSegment(bottomRightPoint1, topRightPoint1);
    simulation.world.createLineSegment(topRightPoint1, topLeftPoint2);

    // Center pit lineSegments
    simulation.world.createLineSegment(topLeftPoint2, bottomLeftPoint2);
    simulation.world.createLineSegment(bottomLeftPoint2, bottomRightPoint2);
    simulation.world.createLineSegment(bottomRightPoint2, topRightPoint2);
    simulation.world.createLineSegment(topRightPoint2, topLeftPoint3);

    // Rightmost pit lineSegments
    simulation.world.createLineSegment(topLeftPoint3, bottomLeftPoint3);
    simulation.world.createLineSegment(bottomLeftPoint3, bottomRightPoint3);
    simulation.world.createLineSegment(bottomRightPoint3, topRightPoint3);
    simulation.world.createLineSegment(topRightPoint3, firstDomePoint);
};

function thunderDome() {
    // Params
    let levelCenter = new Vector2(0, 500);

    let point1 = simulation.world.createPoint(levelCenter.add(new Vector2(-1000, 0)));
    let point2 = simulation.world.createPoint(levelCenter.add(new Vector2(500, -200)));
    let point3 = simulation.world.createPoint(levelCenter.add(new Vector2(500, -1000)));
    let point4 = simulation.world.createPoint(levelCenter.add(new Vector2(-2000, -1200)));
    let point5 = simulation.world.createPoint(levelCenter.add(new Vector2(-4000, 0)));
    let point6 = simulation.world.createPoint(levelCenter.add(new Vector2(-1500, 400)));
    let point7 = simulation.world.createPoint(levelCenter.add(new Vector2(500, 400)));
    let point8 = simulation.world.createPoint(levelCenter.add(new Vector2(3000, -200)));
    let point9 = simulation.world.createPoint(levelCenter.add(new Vector2(3000, -1000)));

    let segment1 = simulation.world.createLineSegment(point1, point2);
    let segment2 = simulation.world.createLineSegment(point2, point3);
    let segment3 = simulation.world.createLineSegment(point3, point4);
    let segment4 = simulation.world.createLineSegment(point4, point5);
    let segment5 = simulation.world.createLineSegment(point5, point6);
    let segment6 = simulation.world.createLineSegment(point6, point7);
    let segment7 = simulation.world.createLineSegment(point7, point8);
    let segment8 = simulation.world.createLineSegment(point8, point9);
    let segment9 = simulation.world.createLineSegment(point9, point3);
}

function createStairwayMap() {
    // Params
    let levelCenter = new Vector2(1100, 800);
    let stepWidth = 650;
    let stepHeight = -140;

    let topLeft = simulation.world.createPoint(levelCenter.add(new Vector2(-2500, -2000)));
    let btmLeft = simulation.world.createPoint(levelCenter.add(new Vector2(-2500, 0)));
    let step1Btm = simulation.world.createPoint(levelCenter.add(new Vector2(-800, 0)));
    let step1Top = simulation.world.createPoint(step1Btm.position.add(new Vector2(0, stepHeight)));
    let step2Btm = simulation.world.createPoint(step1Top.position.add(new Vector2(stepWidth, 0)));
    let step2Top = simulation.world.createPoint(step2Btm.position.add(new Vector2(0, stepHeight)));
    let step3Btm = simulation.world.createPoint(step2Top.position.add(new Vector2(stepWidth, 0)));
    let step3Top = simulation.world.createPoint(step3Btm.position.add(new Vector2(0, stepHeight)));
    let btmRight = simulation.world.createPoint(step3Top.position.add(new Vector2(1500, 0)));
    let topRight = simulation.world.createPoint(step3Top.position.add(new Vector2(1500, -1600)));

    let segment0 = simulation.world.createLineSegment(topLeft, btmLeft);
    let segment1 = simulation.world.createLineSegment(btmLeft, step1Btm);
    let segment2 = simulation.world.createLineSegment(step1Btm, step1Top);
    let segment3 = simulation.world.createLineSegment(step1Top, step2Btm);
    let segment4 = simulation.world.createLineSegment(step2Btm, step2Top);
    let segment5 = simulation.world.createLineSegment(step2Top, step3Btm);
    let segment6 = simulation.world.createLineSegment(step3Btm, step3Top);
    let segment7 = simulation.world.createLineSegment(step3Top, btmRight);
    let segment10 = simulation.world.createLineSegment(btmRight, topRight);
    let segment11 = simulation.world.createLineSegment(topRight, topLeft);
}
//

function deleteWorld() {
    simulation.world.lineSegments = [];
    simulation.world.points = [];
}


function createMenu() {
    
    const menu = document.createElement('div');

    menu.style.position = 'absolute';
    menu.style.bottom = '0';

    menu.style.backgroundColor = 'rgb(160, 160, 160)';

    var height = window.innerHeight * 0.2;
    var width = window.innerWidth;

    menu.style.height = height + 'px';
    menu.style.width = width + 'px';

    document.body.appendChild(menu);


    // Toggle raycasting button

    var button = document.createElement('button');
    button.textContent = 'Toggle Raycast rendering';
    button.disabled = true;

    // Add an onclick event handler to the button
    button.onclick = function() {
        simulation.renderRaycasts = !simulation.renderRaycasts;
        console.log("renderRaycasts: " + simulation.renderRaycasts);
    };

    menu.appendChild(button);

    // Mouse zoom
    simulation.renderer.canvas.addEventListener("wheel", (event) => {
        // Check if the user has scrolled up or down
        if (event.deltaY < 0) {
            simulation.renderer.camera.restZoom *= 1.1; //simulation.renderer.camera.deltaZoom;
        } else {
            simulation.renderer.camera.restZoom /= 1.1; //simulation.renderer.camera.deltaZoom;
        }
    });


    // Pause button

    var pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = true;

    // Add an onclick event handler to the button
    pauseButton.onclick = function() {
        // Toggle the renderRaycasts variable
        simulation.isPaused = !simulation.isPaused;
        console.log("paused: " + simulation.isPaused);
    }

    menu.appendChild(pauseButton);


    // robot selection drop-down menu, based on createRobotFuncs

    // Create a new select element
    var select = document.createElement('select');

    var option = document.createElement('option');
    option.value = "";
    option.textContent = "Select Robot";
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
    select.appendChild(option);

    // Loop through all the createRobot functions
    for (var createRobotFuncName in createRobotFuncs) {
        var option = document.createElement('option');
        option.value = createRobotFuncName;
        option.textContent = createRobotFuncName;
        select.appendChild(option);
    }

    // Add an onchange event handler to the select element
    select.onchange = function() {
        var selectedValue = select.value;
        createRobotFunc = createRobotFuncs[selectedValue];
        simulation.robotSpawner.func = createRobotFunc;
    };

    menu.appendChild(select);

    // Challenge selection drop-down menu, based on createChallengeFuncs

    var selectChallenge = document.createElement('select');

    option = document.createElement('option');
    option.value = "";
    option.textContent = "Select Challenge";
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
    selectChallenge.appendChild(option);

    for (var createChallengeFuncName in createChallengeFuncs) {
        var option = document.createElement('option');
        option.value = createChallengeFuncName;
        option.textContent = createChallengeFuncName;
        selectChallenge.appendChild(option);
    }

    // Add an onchange event handler to the select element
    selectChallenge.onchange = function() {
        var selectedValue = selectChallenge.value;
        createChallengeFunc = createChallengeFuncs[selectedValue];
        simulation.challengeSpawner.func = createChallengeFunc;
    };

    menu.appendChild(selectChallenge);

    // input field for setting numRobots

    var label = document.createElement('label');
    label.textContent = "Number of robots";
    menu.appendChild(label);

    var input = document.createElement('input');
    input.type = 'number';
    input.value = numRobots;
    input.min = 1;
    input.max = 100;
    input.step = 1;

    // Add an oninput event handler to the input element
    input.onchange = function() {
        // Limit the number of robots to the range [1, 100]
        if (input.value < 1) {
            input.value = 1;
        } else if (input.value > 100) {
            input.value = 100;
        }
        // Update the numRobots variable
        numRobots = input.value;
        simulation.robotSpawner.numRobots = input.value;
    };

    menu.appendChild(input);


    // Start / Stop simulation button

    var startStopButton = document.createElement('button');
    startStopButton.textContent = 'Start Challenge!';

    // Add an onclick event handler to the button
    startStopButton.onclick = toggleSimulation;
    
    function toggleSimulation() {
        simulation.isInitiated = !simulation.isInitiated;
        if (simulation.isInitiated) {
            startStopButton.textContent = 'Stop Challenge';
            select.disabled = true;
            selectChallenge.disabled = true;
            button.disabled = false;
            pauseButton.disabled = false;
            input.disabled = true;
            startSimulation();
        } else {
            startStopButton.textContent = 'Start Challenge!';
            select.disabled = false;
            selectChallenge.disabled = false;
            button.disabled = true;
            pauseButton.disabled = true;
            input.disabled = false;
            stopSimulation();
        }
    }

    menu.appendChild(startStopButton);


    // Mouse pan

    var isDragging = false;
    var initialMousePos;
    var initialCameraPos;

    simulation.renderer.canvas.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            isDragging = true;
            initialMousePos = new Vector2(event.clientX, event.clientY);
            initialCameraPos = new Vector2(simulation.renderer.camera.position.x, simulation.renderer.camera.position.y);
        }
    });

    simulation.renderer.canvas.addEventListener("mousemove", (event) => {
        if (isDragging) {
            var currentMousePos = new Vector2(event.clientX, event.clientY);
            var deltaMousePos = currentMousePos.sub(initialMousePos);
            deltaMousePos = deltaMousePos.div(simulation.renderer.camera.zoom);
            simulation.renderer.camera.restPosition.x = (initialCameraPos.x - deltaMousePos.x);
            simulation.renderer.camera.restPosition.y = (initialCameraPos.y - deltaMousePos.y);
        }
    });

    simulation.renderer.canvas.addEventListener("mouseup", (event) => {
        if (event.button === 0) {
            isDragging = false;
        }
    });


    // Mouse select nearest creature

    simulation.renderer.canvas.addEventListener("click", (event) => {
        var mouseX = event.clientX;
        var mouseY = event.clientY;
       
        var worldX = (mouseX - simulation.renderer.canvas.width / 2) / simulation.renderer.camera.zoom + simulation.renderer.camera.position.x;
        var worldY = (mouseY - simulation.renderer.canvas.height / 2) / simulation.renderer.camera.zoom + simulation.renderer.camera.position.y;
       
        var mousePos = new Vector2(worldX, worldY);
       
        var nearestCreature = null;
        var smallestDistance = 50;
       
        simulation.robots.forEach((robot) => {
           var roboWormPos = new Vector2(robot.body.particles[0].position.x, robot.body.particles[0].position.y);
           var distance = mousePos.distance(roboWormPos);
       
           if (distance < smallestDistance) {
              smallestDistance = distance;
              nearestCreature = robot;
           }
        });
       
        if (nearestCreature !== null) {
            simulation.selectedCreature = nearestCreature;
            simulation.followSelectedCreature = false; //disabled, else true;
            console.log({selectedCreature: simulation.selectedCreature});
        } else {
            simulation.selectedCreature = null;
            simulation.followSelectedCreature = false;
            console.log({selectedCreature: simulation.selectedCreature});
        }
    });

    return menu;
}