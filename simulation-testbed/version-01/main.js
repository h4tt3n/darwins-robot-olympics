"use strict";

import { SquishyPlanet } from '../../physics-engine/version-01/squishyPlanet.js';
import { Renderer } from '../../simulation-engine/version-01/renderer.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';

const world = new SquishyPlanet.World();
const renderer = new Renderer('canvas', world);

console.log(world);

let linearState1 = world.createLinearState(new Vector2(0, 0), 0.0);
let linearState2 = world.createLinearState(new Vector2(0, 100), 1.0);
let linearState3 = world.createLinearState(new Vector2(100, 100), 1.0);

linearState3.addImpulse(new Vector2(0, -1000));

let linearSpring1 = world.createLinearSpring(linearState1, linearState2, 0.5, 0.5, 0.5);
let linearSpring2 = world.createLinearSpring(linearState2, linearState3, 0.5, 0.5, 0.5);

let angularSpring1 = world.createAngularSpring(linearSpring1, linearSpring2, 0.5, 0.5, 0.5);

let particle1 = world.createParticle(new Vector2(100, 0), 0.0, 5.0, "rgb(255, 0, 0)");
let particle2 = world.createParticle(new Vector2(100, 100), 1.0, 5.0, "rgb(255, 0, 0)");
let particle3 = world.createParticle(new Vector2(200, 100), 1.0, 5.0, "rgb(255, 0, 0)");

particle3.addImpulse(new Vector2(0, -1000));

let linearSpring3 = world.createLinearSpring(particle1, particle2, 0.5, 0.5, 0.5);
let linearSpring4 = world.createLinearSpring(particle2, particle3, 0.5, 0.5, 0.5);

let angularSpring2 = world.createAngularSpring(linearSpring3, linearSpring4, 0.5, 0.5, 0.5);

//console.log(particle1);

// Simulation loop

function update() {
    world.update();
    renderer.draw();
    requestAnimationFrame(update);
}

update();