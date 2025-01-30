"use strict";

import { constants } from '../constants.js';

// Creation and deletion:
// FLuid constraints are created between two fluid particles when they are closer than radii
// Fluid constraints are deleted when they are further than radii + buffer

class FluidConstraint {
    constructor(pointA, pointB ) {
        this.pointA = pointA;
        this.pointB = pointB;
        this.warmStart = 0.0;
        this.correctionFactor = 0.5;
        this.density = 0.0;
        this.lengthVectorX = 0.0;
        this.lengthVectorY = 0.0;
        this.unitOverDistanceX = 0.0;
        this.unitOverDistanceY = 0.0;
        this.reducedMass = 0.0;
        this.restImpulse = 0.0;
        this.buffer = (pointA.radius + pointB.radius) * 0.1;
        this.isActive = true;

        this.computeReducedMass();
    }
    computeReducedMass(){
        const k = this.pointA.inverseMass + this.pointB.inverseMass;
        this.reducedMass = k > 0.0 ? 1.0 / k : 0.0;
    }
    applyCorrectiveImpulse(){
        const distanceSquared = this.lengthVectorX * this.lengthVectorX + this.lengthVectorY * this.lengthVectorY;
        const radiiSquared = (this.pointA.radius + this.pointB.radius) * (this.pointA.radius + this.pointB.radius);
        
        if (distanceSquared > radiiSquared) { return; }

        const deltaImpulseX = this.pointB.impulse.x - this.pointA.impulse.x;
        const deltaImpulseY = this.pointB.impulse.y - this.pointA.impulse.y;

        const projectedImpulse = this.unitOverDistanceX * deltaImpulseX + this.unitOverDistanceY * deltaImpulseY;
        const impulseError = (projectedImpulse - this.restImpulse) * this.reducedMass * this.correctionFactor;

        const correctiveImpulseX = -this.unitOverDistanceX * impulseError;
        const correctiveImpulseY = -this.unitOverDistanceY * impulseError;

        this.pointA.impulse.x -= correctiveImpulseX * this.pointA.inverseMass;
        this.pointA.impulse.y -= correctiveImpulseY * this.pointA.inverseMass;
        this.pointB.impulse.x += correctiveImpulseX * this.pointB.inverseMass;
        this.pointB.impulse.y += correctiveImpulseY * this.pointB.inverseMass;

        // this.accumulatedImpulse.x += correctiveImpulseX;
        // this.accumulatedImpulse.y += correctiveImpulseY;
    }
    applyWarmStart(){
    //     const distanceSquared = this.lengthVectorX * this.lengthVectorX + this.lengthVectorY * this.lengthVectorY;
    //     const radiiSquared = (this.pointA.radius + this.pointB.radius) * (this.pointA.radius + this.pointB.radius);
    //     if (distanceSquared > radiiSquared) { return; }

    //     const projectedImpulse = this.unitOverDistanceX * this.accumulatedImpulse.x + this.unitOverDistanceY * this.accumulatedImpulse.y;
    //     if( projectedImpulse < 0.0 ) { return };

    //     //console.log("warmstart: ");

    //     const warmwarmstartImpulseX = this.unitOverDistanceX * projectedImpulse * this.warmStart;
    //     const warmwarmstartImpulseY = this.unitOverDistanceY * projectedImpulse * this.warmStart;
    //     this.pointA.impulse.x -= warmwarmstartImpulseX * this.pointA.inverseMass;
    //     this.pointA.impulse.y -= warmwarmstartImpulseY * this.pointA.inverseMass;
    //     this.pointB.impulse.x += warmwarmstartImpulseX * this.pointB.inverseMass;
    //     this.pointB.impulse.y += warmwarmstartImpulseY * this.pointB.inverseMass;
    //     this.accumulatedImpulse.x = 0;
    //     this.accumulatedImpulse.y = 0;
    }
    computeRestImpulse(){
        const deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        const deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;

        const local_velocity = this.unitOverDistanceX * deltaVelocityX + this.unitOverDistanceY * deltaVelocityY;
        //const projected_velocity_sum = this.pointA.projectedVel + this.pointB.projectedVel;

        const global_pressure = constants.GLOBAL_PRESSURE_COEFF * ((this.pointA.density + this.pointB.density) - constants.REST_DENSITY);
        //const global_damping = -projected_velocity_sum * constants.GLOBAL_DAMPING_COEFF;
        const local_pressure = constants.LOCAL_PRESSURE_COEFF * this.density;
        const local_damping  = -local_velocity * constants.LOCAL_DAMPING_COEFF;

        this.restImpulse = global_pressure + local_pressure + local_damping;
        //this.restImpulse = global_damping + local_damping;

        // const universal_coefficient = 1.0;
        // const universal_kernel = (PARTICLE_RADIUS-distance)/((universal_coefficient*distance+1)*PARTICLE_RADIUS);
        // const deltaPosition = this.pointB.position.sub(this.pointA.position);
        // const deltaVelocity = this.pointB.velocity.sub(this.pointA.velocity);
        // const positionError = this.angleVector.dot(deltaPosition) - this.restLength;
        // const velocityError = this.angleVector.dot(deltaVelocity);
        // this.restImpulse = -(positionError * this.stiffness * constants.INV_DT + velocityError * this.damping);
    }
    computeData(){
        
        //super.computeLengthVector();

        this.lengthVectorX = this.pointB.position.x - this.pointA.position.x;
        this.lengthVectorY = this.pointB.position.y - this.pointA.position.y;

        const distanceSquared = this.lengthVectorX * this.lengthVectorX + this.lengthVectorY * this.lengthVectorY;
        const radiiSquaredBuffer = (this.pointA.radius + this.pointB.radius + this.buffer) * (this.pointA.radius + this.pointB.radius + this.buffer);

        if (distanceSquared > radiiSquaredBuffer) { this.isActive = false; return; }

        const radiiSquared = (this.pointA.radius + this.pointB.radius) * (this.pointA.radius + this.pointB.radius);

        if (distanceSquared > radiiSquared) { return; }

        //this.unitOverDistance = distanceSquared > 1.0 ? this.lengthVector.div(distanceSquared) : this.lengthVector.mul(distanceSquared);
        if(distanceSquared === 0.0) { 
            return; 
        } else if (distanceSquared < 1.0) {
            this.unitOverDistanceX = this.lengthVectorX * distanceSquared;
            this.unitOverDistanceY = this.lengthVectorY * distanceSquared;
        } else if (distanceSquared >= 1.0) {
            this.unitOverDistanceX = this.lengthVectorX / distanceSquared;
            this.unitOverDistanceY = this.lengthVectorY / distanceSquared;
        }

        //this.unitOverDistance = distanceSquared > 10.0 ? this.lengthVector.div(distanceSquared) : new Vector2();
        //this.unitOverDistanceX = this.lengthVectorX / distanceSquared;
        //this.unitOverDistanceY = this.lengthVectorY / distanceSquared;

        //const distanceKernel = 1.0 - distanceSquared * INVERSE_PARTICLE_RADIUS_SQUARED; // Good // Same as (r^2-x^2)/r^2 but less flexible
        //const distanceKernel = PARTICLE_RADIUS_SQUARED / (distanceSquared + PARTICLE_RADIUS_SQUARED) // Good
        //const distanceKernel = (PARTICLE_RADIUS_SQUARED / (distanceSquared + PARTICLE_RADIUS_SQUARED)) - 0.5
        const distanceKernel = (constants.PARTICLE_RADIUS_SQUARED - distanceSquared) * constants.INVERSE_PARTICLE_RADIUS_SQUARED; // Good // Same as 1-(x^2/r^2) but more flexible
        
        //const distance_coefficient = 0.9;
        //const distanceKernel = (constants.PARTICLE_RADIUS_SQUARED-distanceSquared)/(distance_coefficient*(constants.PARTICLE_RADIUS_SQUARED+distanceSquared));
        //const distanceKernel = (constants.PARTICLE_RADIUS_SQUARED-distanceSquared)/((distance_coefficient*distanceSquared+1)*constants.PARTICLE_RADIUS_SQUARED);
        //const distanceKernel = (constants.PARTICLE_RADIUS_SQUARED-distanceSquared)/(distance_coefficient*distance_coefficient);
        //const distanceKernel = (constants.PARTICLE_RADIUS_SQUARED-distanceSquared)/constants.PARTICLE_RADIUS_SQUARED;

        const density = distanceKernel * distanceKernel * distanceKernel;
        
        this.density = density * density;

        this.pointA.density += density;
        this.pointB.density += density;

        // const deltaVelocityX = this.pointB.velocity.x - this.pointA.velocity.x;
        // const deltaVelocityY = this.pointB.velocity.y - this.pointA.velocity.y;

        // const projectedVel = this.unitOverDistanceX * deltaVelocityX + this.unitOverDistanceY * deltaVelocityY;

        // this.pointA.projectedVel += projectedVel;
        // this.pointB.projectedVel += projectedVel;
    }
};

export { FluidConstraint };