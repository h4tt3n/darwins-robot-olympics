"use strict";

import { constants } from "../constants.js";
import { Vector2 } from "../../../vector-library/version-02/vector2.js";
import { LinearState } from "../base/linearState.js";
import { Particle } from "./particle.js";
import { FixedSpring } from "../constraints/fixedSpring.js";

class ShapeMatchingBody extends LinearState {
    constructor(position, mass) {
        super(position, mass);

        this.stiffness = 0.25; // for pressure
        this.damping = 0.5; // for pressure
        this.warmStart = 0.5; // for pressure
        this.restImpulse = 0.0; // for pressure
        this.accumulatedImpulse = new Vector2(); // for pressure
        this.angle = 0.0;
        this.angularVelocity = 0.0;
        this.angularImpulse = 0.0;
        this.angularImpulse_prev = 0.0;
        this.impulse_prev = new Vector2();
        this.inertia = 0.0;
        this.inverseInertia = 0.0;
        this.area = 0.0;
        this.restArea = 0.0;
        this.pressureK = 0.01
        this.angleVector = new Vector2();
        //this.angularVelocityVector = new Vector2();

        this.particles = [];
        this.fixedSprings = [];

        //this.init();
    }
    init() {

        //this.computeMass();
        this.computeInverseMass();

        //this.computeArea();

        this.computeData();
        this.computeArea();

        this.restArea = this.area;

        // Angle vector from angle
        this.angleVector = new Vector2(Math.cos(this.angle), Math.sin(this.angle));

        //console.log(this);
    }
    computeMass() {
        this.mass = 0.0;
        for (let i = 0; i < this.particles.length; i++) {
            this.mass += this.particles[i].mass;
        }
    }
    computeArea() {
        this.area = 0.0;
        for (let i = 0; i < this.particles.length; i++) {
            const j = (i + 1) % this.particles.length;
            const PmassI = this.particles[i];
            const PmassJ = this.particles[j];
            this.area += PmassI.position.perpDot(PmassJ.position);
        }
        this.area *= 0.5;
    }
    addParticle(particle) {
        if (particle instanceof Particle) {
            this.particles.push(particle);
        }
    }
    removeParticle(particle) {
        if (particle instanceof Particle) {
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }
    }
    addFixedSpring(fixedSpring) {
        if (fixedSpring instanceof FixedSpring) {
            this.fixedSprings.push(fixedSpring);
        }
    }
    removeFixedSpring(fixedSpring) {
        if (fixedSpring instanceof FixedSpring) {
            const index = this.fixedSprings.indexOf(fixedSpring);
            if (index > -1) {
                this.fixedSprings.splice(index, 1);
            }
        }
    }

    applyWarmStart() {
        for (let i = 0; i < this.fixedSprings.length; i++) {
            this.fixedSprings[i].applyWarmStart();
        }
    }
    applyCorrectiveImpulse(){
        for (let i = 0; i < this.fixedSprings.length; i++) {
            this.fixedSprings[i].applyCorrectiveImpulse();
        }
        for (let i = this.fixedSprings.length - 1; i > 0; --i) { 
            this.fixedSprings[i].applyCorrectiveImpulse();
        }
    }
    computeRestImpulse() {

        // pressure
        const distanceError = (Math.sqrt(Math.abs(this.area)) * Math.sign(this.area)) - (Math.sqrt(this.restArea));
        this.restImpulse = -(distanceError * this.stiffness * 0.5 * constants.INV_DT);
        
        for (let i = 0; i < this.fixedSprings.length; i++) {
            this.fixedSprings[i].computeRestImpulse();
        }
    }
    computeData() {
        // state vectors and area
        this.position = new Vector2();
        this.velocity = new Vector2();
        this.area = 0.0;
    
        for (let i = 0; i < this.particles.length; i++) {
            const j = (i + 1) % this.particles.length;
            const PmassI = this.particles[i];
            const PmassJ = this.particles[j];
            this.position = this.position.add(PmassI.position.mul(PmassI.mass));
            this.velocity = this.velocity.add(PmassI.velocity.mul(PmassI.mass));
            this.area += PmassI.position.perpDot(PmassJ.position);
        }
    
        this.position = this.position.mul(this.inverseMass);
        this.velocity = this.velocity.mul(this.inverseMass);
        this.area *= 0.5;
    
        //  moment of inertia and angular velocity
        this.inertia = 0.0;
        this.angularVelocity = 0.0;
    
        for (let i = 0; i < this.particles.length; i++) {
            const Pmass = this.particles[i];
            const local_position = Pmass.position.sub(this.position);
            const local_velocity = Pmass.velocity.sub(this.velocity);
            this.inertia += local_position.lengthSquared() * Pmass.mass;
            this.angularVelocity += local_position.perpDot(local_velocity.mul(Pmass.mass));
        }
    
        this.inverseInertia = this.inertia > 0.0 ? 1.0 / this.inertia : 0.0;
        this.angularVelocity *= this.inverseInertia;

        //console.log(this);
    }
    computeNewState(){
        //const delta_angle = 0.0;
        //const delta_angle_vector = new Vector2(1.0, 0.0);
        //if (this.angularImpulse != 0.0) {
        this.angularVelocity += this.angularImpulse * this.inverseInertia; // TODO: Refactor algorithm to remove DT   
        const delta_angle = this.angularVelocity * constants.DT;
        const delta_angle_vector = new Vector2(Math.cos(delta_angle), Math.sin(delta_angle));
       // }
        this.angle += this.angularVelocity * constants.DT
        this.angleVector = this.angleVector.rotate(delta_angle_vector);

        for (let j = 0; j < this.fixedSprings.length; j++) {
            this.fixedSprings[j].restLength = this.fixedSprings[j].restLength.rotate(delta_angle_vector);
        }
    
        //console.log(this.angularImpulse)

        //console.log(this);
    
        this.angularImpulse = 0.0;
        this.impulse = new Vector2();


    }
    bodyParticleInteraction() {
        let new_linear = new Vector2();
        let new_angular = 0.0;
        for (let j = 0; j < this.particles.length; j++) {
            const Pmass = this.particles[j];
            const local_position = Pmass.position.sub(this.position);
            new_linear = new_linear.add(Pmass.impulse.mul(Pmass.mass));
            new_angular -= local_position.perpDot(Pmass.impulse.mul(Pmass.mass));
            //console.log(new_angular);
        }
        this.impulse = this.impulse.add(new_linear.mul(this.inverseMass))
        this.angularImpulse += new_angular * this.inverseInertia;
        //console.log(this.inverseInertia);  
        //this.impulse = this.impulse.add(new_linear.mul(this.inverseMass).sub(this.impulse_prev));
        //this.angularImpulse += new_angular * this.inverseInertia - this.angularImpulse_prev;
        for (let j = 0; j < this.particles.length; j++) {
            const Pmass = this.particles[j]
            const local_position = Pmass.position.sub(this.position)
            Pmass.impulse = Pmass.impulse.add(this.impulse.add(local_position.perpDot(this.angularImpulse)));
        }
        this.impulse_prev = this.impulse;
        this.angularImpulse_prev = this.angularImpulse;
    }
    applyInternalImpulses() {

         // TODO: Replace with new pressure algorithm
    
        //  area preserving pressure impulse
        const pressureImpulse = -this.pressureK * (this.area - this.restArea)
        //const pressureImpulse = -this.pressureK * (Math.sqrt(this.area) - Math.sqrt(this.restArea));
    
        let circumference_sqared = 0.0
        let rest_circumference_sqared = 0.0
    
        // scale factor
        for (let j = 0; j < this.fixedSprings.length; j++) {
            const PointA = this.fixedSprings[j].pointA
            const PointB = this.fixedSprings[j].pointB
            const lengthvector = PointA.position.sub(PointB.position)
            rest_circumference_sqared += this.fixedSprings[j].restLength.lengthSquared()
            circumference_sqared += lengthvector.lengthSquared()
        }
    
        // must be the same for all springs in the body
        const Scale = rest_circumference_sqared / (rest_circumference_sqared + circumference_sqared)
    
        for (let j = 0; j < this.fixedSprings.length; j++) {
            const PointA = this.fixedSprings[j].pointA
            const PointB = this.fixedSprings[j].pointB
            const lengthvector = PointA.position.sub(PointB.position)
        
            //  the impulse scale factor is a hack, since we don't have the spring's unit vector
            //  it prevents impulse from going towards infinity at very large and small spring length values
            //const restLengthSquared = pBody.fixedAngleSprings[j].restLength.lengthSquared()
            const impulse = (lengthvector.perp()).mul(-pressureImpulse * Scale)
            PointA.impulse = PointA.impulse.sub(impulse)
            PointB.impulse = PointB.impulse.sub(impulse)
        }
    }
}

export { ShapeMatchingBody };