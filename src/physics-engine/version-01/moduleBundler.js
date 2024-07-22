"use strict";

/*
    SquishyPlanet Lite
    A 2D soft-body physics engine for games 
    v. 0.1.0 - 2023
*/

// Import

// Constants
import { constants} from './constants.js'

// Math
import { Vector2 } from '../../vector-library/version-01/vector2.js'

import { Point } from './point.js'
import { LineSegment } from './lineSegment.js'

// Base components
import { LinearState } from './linearState.js'
import { AngularState } from './angularState.js'
import { Particle } from './particle.js'
import { Wheel } from './wheel.js'

// Deformable body components
import { LinearLink } from './linearLink.js'
import { FixedSpring } from './fixedSpring.js';
import { LinearSpring } from './linearSpring.js'
import { AngularSpring } from './angularSpring.js'
import { GearConstraint } from './constraints/gearConstraint.js'
import { MotorConstraint } from './constraints/motorConstraint.js'

// Compound bodys
import { Body } from './body.js'

// Collision detection
import { CollisionHandler } from './collision/collisionHandler.js'
import { LineSegmentParticleCollision } from './collision/lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from './collision/particleParticleCollision.js';

// 
import { World } from './world.js'

// Export
export { 
    constants, 
    Vector2, 
    Point, 
    LineSegment, 
    LinearState, 
    AngularState, 
    LinearLink, 
    LinearSpring, 
    FixedSpring,
    AngularSpring,
    GearConstraint,
    MotorConstraint,
    Particle, 
    Wheel,
    Body,
    CollisionHandler,
    LineSegmentParticleCollision,
    ParticleParticleCollision,
    World 
};