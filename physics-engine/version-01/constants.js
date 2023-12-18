"use strict";

// class Constants {
//     static DT = 1.0 / 60.0; 
//     static INV_DT = 1.0 / Constants.DT;
//     static FPS = 60;
//     static NUM_ITERATIONS = 8;
//     static GRAVITY = 0;
// }
//
// export { Constants };

const DT             = new Number(1.0 / 60.0);
const INV_DT         = new Number(1.0 / DT);
const FPS            = new Number(60);
const NUM_ITERATIONS = new Number(8);
const GRAVITY        = new Number(9.82); // 9.82

const constants = {
    DT              : DT,
    INV_DT          : INV_DT,
    FPS             : FPS,
    NUM_ITERATIONS  : NUM_ITERATIONS,
    GRAVITY         : GRAVITY,
};

Object.freeze(constants);

export { constants };