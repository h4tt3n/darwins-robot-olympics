"use strict";

/*
    SquishyPlanet Lite
    A 2D soft-body physics engine for games 
    v. 0.2.0 - 2024
*/

// Import

// Constants
import { constants} from './constants.js'
import { ObjectType } from './objectType.js'

// Math
import { Vector2 } from '../../vector-library/version-02/vector2.js'

import { Point } from './base/point.js'
import { LineSegment } from './base/lineSegment.js'

// Base components
import { LinearState } from './base/linearState.js'
import { AngularState } from './base/angularState.js'
import { Particle } from './objects/particle.js'
import { FluidParticle } from './objects/fluidParticle.js';
import { DeformableParticle } from './objects/deformableParticle.js';
import { Wheel } from './objects/wheel.js'

// Deformable body components
import { LinearLink } from './base/linearLink.js'

// Constraints
import { FixedSpring } from './constraints/fixedSpring.js';
import { LinearSpring } from './constraints/linearSpring.js'
import { DeformableSpring } from './constraints/deformableSpring.js'
import { AngularSpring } from './constraints/angularSpring.js'
import { VolumeConstraint } from './constraints/volumeConstraint.js'
import { WorldBorderConstraint } from './constraints/worldBorderConstraint.js';
import { GearConstraint } from './constraints/gearConstraint.js'
import { MotorConstraint } from './constraints/motorConstraint.js'
import { LinearMotorConstraint } from './constraints/linearMotorConstraint.js'
import { ParticleBoundingBoxConstraint } from './constraints/particleBoundingBoxConstraint.js'
import { AerodynamicConstraint } from './constraints/aerodynamicCostraint.js'

// Compound bodys
import { Body } from './objects/body.js'
import { SoftBody } from './objects/softBody.js'
//import { ShapeMatchingBody } from './objects/shapeMatchingBody.js'

// Collision detection
//import { CollisionHandler } from './collision/collisionHandler.js'
import { LineSegmentParticleCollision } from './collision/lineSegmentParticleCollision.js';
import { ParticleParticleCollision } from './collision/particleParticleCollision.js';

// 
import { World } from './world.js'

// Export
export { 
    constants, ObjectType, Vector2, 
    Point, LineSegment, 
    LinearState, AngularState, 
    LinearLink, 
    LinearSpring, DeformableSpring, FixedSpring, AngularSpring, VolumeConstraint, 
    WorldBorderConstraint, GearConstraint, MotorConstraint, LinearMotorConstraint, ParticleBoundingBoxConstraint, AerodynamicConstraint,
    Particle, FluidParticle, DeformableParticle, Wheel, Body, SoftBody,
    //CollisionHandler,
    LineSegmentParticleCollision, ParticleParticleCollision,
    World 
};