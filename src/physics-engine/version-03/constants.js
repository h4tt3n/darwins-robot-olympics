"use strict";

import { Vector2 } from "../../vector-library/version-02/vector2.js";

// class Constants {
//     static DT = 1.0 / 60.0; 
//     static INV_DT = 1.0 / Constants.DT;
//     static FPS = 60;
//     static NUM_ITERATIONS = 8;
//     static GRAVITY = 0;
// }
//
// export { Constants };

const DT             = new Number(1.0 / 120.0);
const INV_DT         = new Number(1.0 / DT);
const FPS            = new Number(60);
const NUM_ITERATIONS = new Number(5);
const GRAVITY        = new Vector2(0.0, 0.0);

// Fluid Constants
const PARTICLE_RADIUS = 24.0;     
const INVERSE_PARTICLE_RADIUS = 1.0 / PARTICLE_RADIUS;
const PARTICLE_RADIUS_SQUARED = PARTICLE_RADIUS * PARTICLE_RADIUS;
const INVERSE_PARTICLE_RADIUS_SQUARED = 1.0 / PARTICLE_RADIUS_SQUARED;
const LOCAL_PRESSURE_COEFF = 200.0; // 50.0;
const GLOBAL_PRESSURE_COEFF = 100.0; //25.0;
const LOCAL_DAMPING_COEFF = 2.0; //0.5;
const GLOBAL_DAMPING_COEFF = 1.0;
const REST_DENSITY = 2.5; //10.0;

const constants = {
    DT              : DT,
    INV_DT          : INV_DT,
    FPS             : FPS,
    NUM_ITERATIONS  : NUM_ITERATIONS,
    GRAVITY         : GRAVITY,
    PARTICLE_RADIUS : PARTICLE_RADIUS,
    INVERSE_PARTICLE_RADIUS : INVERSE_PARTICLE_RADIUS,
    PARTICLE_RADIUS_SQUARED : PARTICLE_RADIUS_SQUARED,
    INVERSE_PARTICLE_RADIUS_SQUARED : INVERSE_PARTICLE_RADIUS_SQUARED,
    LOCAL_PRESSURE_COEFF : LOCAL_PRESSURE_COEFF,
    GLOBAL_PRESSURE_COEFF : GLOBAL_PRESSURE_COEFF,
    LOCAL_DAMPING_COEFF : LOCAL_DAMPING_COEFF,
    GLOBAL_DAMPING_COEFF : GLOBAL_DAMPING_COEFF,
    REST_DENSITY : REST_DENSITY
};

//Object.freeze(constants);

export { constants };