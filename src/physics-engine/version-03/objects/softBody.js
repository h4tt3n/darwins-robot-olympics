"use strict";

import { constants } from '../constants.js';
import { Vector2 } from '../../../vector-library/version-02/vector2.js';
import { Particle } from './particle.js';
import { LinearSpring } from '../constraints/linearSpring.js';
import { AngularSpring } from '../constraints/angularSpring.js';

class SoftBody {
    constructor() {
        this.stiffness = 0.5;
        this.damping = null;
        this.warmstart = null;
        this.correctionFactor = 0.01;
        this.position = new Vector2();
		this.velocity = new Vector2();
        this.mass = 0.0;
        this.inverseMass = 0.0;
		this.area = 0.0;
		this.restArea = 0.0;
        this.sqrtRestArea = 0.0;
        this.restImpulse = 0.0;
        this.color = "rgb(255, 192, 32)";
        this.isPressurized = false;

        this.particles = [];
        this.linearSprings = [];
        this.nonPressurizedLinearSprings = [];
        this.angularSprings = [];
    }
    init() {

        this.computeMass();
        this.computeData();

        this.restArea = this.area;
        this.sqrtRestArea = Math.sqrt(this.restArea);
    }
    computeMass() {
        this.mass = 0.0;
        for (let i = 0; i < this.particles.length; i++) {
            this.mass += this.particles[i].mass;
        }
        this.inverseMass = this.mass > 0.0 ? 1.0 / this.mass : 0.0;
    }
    addParticle(particle) {
        this.particles.push(particle);
    }
    addLinearSpring(linearSpring) {
        this.linearSprings.push(linearSpring);
    }
    addNonPressurizedLinearSpring(linearSpring) {
        this.nonPressurizedLinearSprings.push(linearSpring);
    }
    addAngularSpring(angularSpring) {
        this.angularSprings.push(angularSpring);
    }
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }
    removeLinearSpring(linearSpring) {
        const index = this.linearSprings.indexOf(linearSpring);
        if (index > -1) {
            this.linearSprings.splice(index, 1);
        }
    }
    removeNonPressurizedLinearSpring(linearSpring) {
        const index = this.nonPressurizedLinearSprings.indexOf(linearSpring);
        if (index > -1) {
            this.nonPressurizedLinearSprings.splice(index, 1);
        }
    }
    removeAngularSpring(angularSpring) {
        const index = this.angularSprings.indexOf(angularSpring);
        if (index > -1) {
            this.angularSprings.splice(index, 1);
        }
    }
    applyCorrectiveImpulse(){

        if (!this.isPressurized) { return; }

        // const correctiveImpulseSumX = 0.0;
        // const correctiveImpulseSumY = 0.0;

        this.linearSprings.forEach( linearSpring => {
            const perp = linearSpring.angleVector.perp();

            const projectedImpulseA = perp.x * linearSpring.pointA.impulse.x + perp.y * linearSpring.pointA.impulse.y;
            const projectedImpulseB = perp.x * linearSpring.pointB.impulse.x + perp.y * linearSpring.pointB.impulse.y;

            const impulseErrorA = (projectedImpulseA - this.restImpulse) * this.correctionFactor;
            const impulseErrorB = (projectedImpulseB - this.restImpulse) * this.correctionFactor;

            const correctiveImpulseXA = -perp.x * impulseErrorA;
            const correctiveImpulseYA = -perp.y * impulseErrorA;

            const correctiveImpulseXB = -perp.x * impulseErrorB;
            const correctiveImpulseYB = -perp.y * impulseErrorB;
    
            linearSpring.pointA.impulse.x -= correctiveImpulseXA * linearSpring.pointA.inverseMass;
            linearSpring.pointA.impulse.y -= correctiveImpulseYA * linearSpring.pointA.inverseMass;

            linearSpring.pointB.impulse.x -= correctiveImpulseXB * linearSpring.pointB.inverseMass;
            linearSpring.pointB.impulse.y -= correctiveImpulseYB * linearSpring.pointB.inverseMass;

            // correctiveImpulseSumX += correctiveImpulseXA;
            // correctiveImpulseSumY += correctiveImpulseYA;

            // correctiveImpulseSumX += correctiveImpulseXB;
            // correctiveImpulseSumY += correctiveImpulseYB;
        });

        // this.particles.forEach( particle => {

        //     correctiveImpulseSumX /= this.mass;
        //     correctiveImpulseSumY /= this.mass;

        //     particle.impulse.x += correctiveImpulseSumX * particle.inverseMass;
        //     particle.impulse.y += correctiveImpulseSumY * particle.inverseMass;
            
        // });
    }
    applyCorrectiveImpulseReverse() {

        if (!this.isPressurized) { return; }

        // const correctiveImpulseSumX = 0.0;
        // const correctiveImpulseSumY = 0.0;

        this.linearSprings.reverse().forEach( linearSpring => {
            const perp = linearSpring.angleVector.perp();

            const projectedImpulseA = perp.x * linearSpring.pointA.impulse.x + perp.y * linearSpring.pointA.impulse.y;
            const projectedImpulseB = perp.x * linearSpring.pointB.impulse.x + perp.y * linearSpring.pointB.impulse.y;

            const impulseErrorA = (projectedImpulseA - this.restImpulse) * this.correctionFactor;
            const impulseErrorB = (projectedImpulseB - this.restImpulse) * this.correctionFactor;

            const correctiveImpulseXA = -perp.x * impulseErrorA;
            const correctiveImpulseYA = -perp.y * impulseErrorA;

            const correctiveImpulseXB = -perp.x * impulseErrorB;
            const correctiveImpulseYB = -perp.y * impulseErrorB;
    
            linearSpring.pointA.impulse.x -= correctiveImpulseXA * linearSpring.pointA.inverseMass;
            linearSpring.pointA.impulse.y -= correctiveImpulseYA * linearSpring.pointA.inverseMass;

            linearSpring.pointB.impulse.x -= correctiveImpulseXB * linearSpring.pointB.inverseMass;
            linearSpring.pointB.impulse.y -= correctiveImpulseYB * linearSpring.pointB.inverseMass;

            // correctiveImpulseSumX += correctiveImpulseXA;
            // correctiveImpulseSumY += correctiveImpulseYA;

            // correctiveImpulseSumX += correctiveImpulseXB;
            // correctiveImpulseSumY += correctiveImpulseYB;
        });

        // this.particles.forEach( particle => {

        //     correctiveImpulseSumX /= this.mass;
        //     correctiveImpulseSumY /= this.mass;

        //     particle.impulse.x += correctiveImpulseSumX * particle.inverseMass;
        //     particle.impulse.y += correctiveImpulseSumY * particle.inverseMass;
            
        // });
    }
    applyWarmStart(){
    }
    computeRestImpulse() {

        if (!this.isPressurized) { return; }

        const scaleFactor = this.area > 0.0 ? this.sqrtRestArea / Math.sqrt(this.area) : 1.0;
        const positionError = (1 - scaleFactor) * this.sqrtRestArea;

        this.restImpulse = -(positionError * this.stiffness * constants.INV_DT);
    }

    computeData(){

		// for (let i = 0; i < this.particles.length; i++) {
		// 	const j = (i + 1) % this.particles.length;
		// 	const PmassI = this.particles[i];
		// 	const PmassJ = this.particles[j];
		// 	this.position = this.position.add(PmassI.position.mul(PmassI.mass));
		// 	this.velocity = this.velocity.add(PmassI.velocity.mul(PmassI.mass));
		// 	this.area += PmassI.position.perpDot(PmassJ.position);
		// }

        // Compute area
        this.area = 0.0;

        for (let i = 0; i < this.linearSprings.length; i++) {
            const PmassI = this.linearSprings[i].pointA;
            const PmassJ = this.linearSprings[i].pointB;
            //this.area += PmassI.position.perpDot(PmassJ.position);
            this.area += PmassI.position.x * PmassJ.position.y - PmassI.position.y * PmassJ.position.x;
        }

        this.area *= 0.5;

        // Compute position and velocity
        this.position = new Vector2();
		this.velocity = new Vector2();

        for (let i = 0; i < this.particles.length; i++) {
            const PmassI = this.particles[i];
            this.position = this.position.add(PmassI.position.mul(PmassI.mass));
            this.velocity = this.velocity.add(PmassI.velocity.mul(PmassI.mass));
        }
	
		this.position = this.position.mul(this.inverseMass);
		this.velocity = this.velocity.mul(this.inverseMass);

	
		//  moment of inertia and angular velocity
		this.inertia = 0.0;
		this.angularVelocity = 0.0;
	
		for (let i = 0; i < this.particles.length; i++) {
			const Pmass = this.particles[i];
			const local_position = Pmass.position.sub(this.position);
			const local_velocity = Pmass.velocity.sub(this.velocity);
			this.inertia += local_position.lengthSquared() * this.mass;
			this.angularVelocity += local_position.perpDot(local_velocity.mul(this.mass));
		}
	
		this.inverseInertia = this.inertia > 0.0 ? 1.0 / this.inertia : 0.0;
		this.angularVelocity *= this.inverseInertia;
	}

}

export { SoftBody };