"use strict";

import { constants} from './constants.js'
import { Point } from './base/point.js'
import { LineSegment } from './base/lineSegment.js'
import { LinearState } from './base/linearState.js'
import { AngularState } from './base/angularState.js'
import { Particle } from './objects/particle.js'
import { LinearLink } from './base/linearLink.js'
import { LinearSpring } from './constraints/linearSpring.js'
//import { DeformableSpring } from './moduleBundler.js';
import { FixedSpring } from './constraints/fixedSpring.js';
import { VolumeConstraint } from './moduleBundler.js';
import { AngularSpring } from './constraints/angularSpring.js'
import { GearConstraint } from './constraints/gearConstraint.js'
import { MotorConstraint } from './constraints/motorConstraint.js'
import { LinearMotorConstraint } from './moduleBundler.js';
import { ParticleBoundingBoxConstraint } from './moduleBundler.js';
import { FluidConstraint } from './constraints/fluidConstraint.js';
import { AerodynamicConstraint } from './constraints/aerodynamicCostraint.js'
import { FluidParticle } from './objects/fluidParticle.js';
import { DeformableParticle } from './objects/deformableParticle.js';
import { WorldBorderConstraint } from './constraints/worldBorderConstraint.js'
//import { CollisionHandler } from './collision/collisionHandler.js'
import { SpatialHashGrid } from './collision/spatialHashGrid.js';
import { Wheel } from './objects/wheel.js'
//import { Body } from './objects/body.js';
//import { ShapeMatchingBody } from './objects/shapeMatchingBody.js';
import { SoftBody } from './moduleBundler.js';
//import { ToolBox } from '../../toolbox/version-01/toolbox.js';

class World {
    constructor(params = {}){
        this.params = params;
        this.boundaries =
        {
            minX: 0,
            minY: 0,
            maxX: this.params.maxX,
            maxY: this.params.maxY
        }
        this.points = [];
        this.lineSegments = [];
        this.linearStates = [];
        this.angularStates = [];
        this.linearLinks = [];
        this.fixedSprings = [];
        this.linearSprings = [];
        //this.deformableSprings = [];
        this.angularSprings = [];
        this.volumeConstraints = [];
        this.gearConstraints = [];
        this.motorConstraints = [];
        this.linearMotorConstraints = [];
        this.particleBoundingBoxConstraints = [];
        this.worldBorderConstraints = [];
        this.aerodynamicConstraints = [];
        
        this.particles = [];
        this.fluidParticles = [];
        this.deformableParticles = [];
        this.wheels = [];
        this.bodys = [];
        this.softBodys = [];
        //this.shapeMatchingBodys = [];
        
        this.collisions = new Map();
        this.fluidConstraints = new Map();
        this.deformableConstraints = new Map();
        
        this.objectIdCounter = 0;
        //this.collisionHandler = new CollisionHandler(this);
        this.spatialHashGrid = new SpatialHashGrid(this, 30, this.boundaries.maxX, this.boundaries.maxY);
    }
    reset() {
        this.points = [];
        this.lineSegments = [];
        this.linearStates = [];
        this.angularStates = [];
        this.linearLinks = [];
        this.fixedSprings = [];
        this.linearSprings = [];
        //this.deformableSprings = [];
        this.angularSprings = [];
        this.volumeConstraints = [];
        this.gearConstraints = [];
        this.motorConstraints = [];
        this.linearMotorConstraints = [];
        this.particleBoundingBoxConstraints = [];
        this.worldBorderConstraints = [];
        this.aerodynamicConstraints = [];
        
        this.particles = [];
        this.fluidParticles = [];
        this.deformableParticles = [];
        this.wheels = [];
        this.bodys = [];
        this.softBodys = [];
        //this.shapeMatchingBodys = [];

        this.collisions = new Map();
        this.fluidConstraints = new Map();
        this.deformableConstraints = new Map();
        
        this.objectIdCounter = 0;
        //this.collisionHandler = new CollisionHandler(this);
        this.spatialHashGrid = new SpatialHashGrid(this, 30, this.boundaries.maxX, this.boundaries.maxY);
    }
    applyImpulses(){

        this.worldBorderConstraints.forEach(w => { w.applyCorrectiveImpulse() });

        for(let i = 0; i < constants.NUM_ITERATIONS; i++){

            // Arrays
            //this.particleBoundingBoxConstraints.forEach(p => { p.applyCorrectiveImpulse() });

            //this.shapeMatchingBodys.forEach(s => { s.applyCorrectiveImpulse() });

            this.softBodys.forEach(s => { s.applyCorrectiveImpulse() });
            
            this.volumeConstraints.forEach(v => { v.applyCorrectiveImpulse() });
            this.angularSprings.forEach(a => { a.applyCorrectiveImpulse() });
            this.linearSprings.forEach(l => { l.applyCorrectiveImpulse() });
            this.fixedSprings.forEach(f => { f.applyCorrectiveImpulse() });
            this.gearConstraints.forEach(g => { g.applyCorrectiveImpulse() });
            this.motorConstraints.forEach(m => { m.applyCorrectiveImpulse() });
            this.linearMotorConstraints.forEach(m => { m.applyCorrectiveImpulse() });
            this.aerodynamicConstraints.forEach(a => { a.applyCorrectiveImpulse() });
            
            // Maps
            this.collisions.forEach(c => { c.applyCorrectiveImpulse() });
            this.fluidConstraints.forEach(f => { f.applyCorrectiveImpulse() });
            this.deformableConstraints.forEach(d => { d.applyCorrectiveImpulse() });
    
            
            // Arrays
            //this.particleBoundingBoxConstraints.reverse().forEach(p => { p.applyCorrectiveImpulse() });

            //this.shapeMatchingBodys.forEach(s => { s.applyCorrectiveImpulse() });

            this.softBodys.forEach(s => { s.applyCorrectiveImpulseReverse() });

            this.angularSprings.reverse().forEach(a => { a.applyCorrectiveImpulse() });
            this.linearSprings.reverse().forEach(l => { l.applyCorrectiveImpulse() });
            this.volumeConstraints.forEach(v => { v.applyCorrectiveImpulseReverse() });
            this.fixedSprings.reverse().forEach(f => { f.applyCorrectiveImpulse() });
            this.gearConstraints.reverse().forEach(g => { g.applyCorrectiveImpulse() });
            this.motorConstraints.reverse().forEach(m => { m.applyCorrectiveImpulse() });
            this.linearMotorConstraints.reverse().forEach(m => { m.applyCorrectiveImpulse() });

            // Maps
            //this.collisions.forEach(c => { c.applyCorrectiveImpulse() });
            //this.fluidConstraints.forEach(f => { f.applyCorrectiveImpulse() });
            //this.deformableConstraints.forEach(d => { d.applyCorrectiveImpulse() });
            Array.from(this.collisions.values()).reverse().forEach(c => { c.applyCorrectiveImpulse() });
            Array.from(this.fluidConstraints.values()).reverse().forEach(f => { f.applyCorrectiveImpulse() });
            Array.from(this.deformableConstraints.values()).reverse().forEach(d => { d.applyCorrectiveImpulse() });
        }
    }
    applyWarmStart(){

        // this.shapeMatchingBodys.forEach(s => { s.applyWarmStart() });
        // this.shapeMatchingBodys.forEach(s => { s.applyInternalImpulses() });

        this.volumeConstraints.forEach(v => { v.applyWarmStart() });
        this.angularSprings.forEach(a => { a.applyWarmStart() });
        this.linearSprings.forEach(l => { l.applyWarmStart() });
        //this.deformableSprings.forEach(d => { d.applyWarmStart() });
        this.fixedSprings.forEach(f => { f.applyWarmStart() });
        this.gearConstraints.forEach(g => { g.applyWarmStart() });
        this.motorConstraints.forEach(m => { m.applyWarmStart() });
        this.linearMotorConstraints.forEach(m => { m.applyWarmStart() });
        this.collisions.forEach(c => { c.applyWarmStart() });
        this.fluidConstraints.forEach(f => { f.applyWarmStart() });
        this.deformableConstraints.forEach(d => { d.applyWarmStart() });
        this.aerodynamicConstraints.forEach(a => { a.applyWarmStart() });

    }
    computeData(){
        this.volumeConstraints.forEach(v => { v.computeData() });
        this.linearSprings.forEach(l => { l.computeData() });
        //this.deformableSprings.forEach(d => { d.computeData() });
        this.fixedSprings.forEach(f => { f.computeData() });
        this.angularSprings.forEach(a => { a.computeData() });
        this.gearConstraints.forEach(g => { g.computeData() });
        this.motorConstraints.forEach(m => { m.computeData() });
        this.linearMotorConstraints.forEach(m => { m.computeData() });
        this.collisions.forEach(c => { c.computeData() });
        this.fluidConstraints.forEach(f => { f.computeData() });
        this.deformableConstraints.forEach(d => { d.computeData() });
        this.bodys.forEach(b => { b.computeData() });
        this.softBodys.forEach(s => { s.computeData() });
        //this.shapeMatchingBodys.forEach(s => { s.computeData() });
    }
    computeNewState(){
        this.linearStates.forEach(l => {l.computeNewState()});
        this.angularStates.forEach(a => {a.computeNewState()});
        this.particles.forEach(p => {p.computeNewState()});
        this.fluidParticles.forEach(p => {p.computeNewState()});
        this.deformableParticles.forEach(p => {p.computeNewState()});
        this.wheels.forEach(w => {w.computeNewState()});
        this.bodys.forEach(b => {b.computeNewState()});
        //this.shapeMatchingBodys.forEach(s => {s.computeNewState()});
    }
    computeRestImpulse(){

        //this.particleBoundingBoxConstraints.forEach(p => { p.computeRestImpulse() });

        //this.shapeMatchingBodys.forEach(s => { s.computeRestImpulse() });

        this.volumeConstraints.forEach(v => { v.computeRestImpulse() });
        this.angularSprings.forEach(a => { a.computeRestImpulse() });
        this.linearSprings.forEach(l => { l.computeRestImpulse() });
        //this.deformableSprings.forEach(d => { d.computeRestImpulse() });
        
        this.fixedSprings.forEach(f => { f.computeRestImpulse() });
        this.gearConstraints.forEach(g => { g.computeRestImpulse() });
        this.motorConstraints.forEach(m => { m.computeRestImpulse() });
        this.linearMotorConstraints.forEach(m => { m.computeRestImpulse() });
        this.collisions.forEach(c => { c.computeRestImpulse() });
        this.fluidConstraints.forEach(f => { f.computeRestImpulse() });
        this.deformableConstraints.forEach(d => { d.computeRestImpulse() });
        this.aerodynamicConstraints.forEach(a => { a.computeRestImpulse() });

        this.bodys.forEach(b => { b.computeRestImpulse() });
        this.softBodys.forEach(s => { s.computeRestImpulse() });
    }
    // bodyParticleInteraction() {
    //     this.shapeMatchingBodys.forEach(shapeMatchingBody => {
    //         shapeMatchingBody.bodyParticleInteraction();
    //     });
    // }
    handleCollisions() {
        this.spatialHashGrid.clear();
        this.spatialHashGrid.removeInactiveCollisions();

        this.particles.forEach(particle => {
            this.spatialHashGrid.insertParticle(particle);
        });

        this.fluidParticles.forEach(fluidParticle => {
            this.spatialHashGrid.insertParticle(fluidParticle);
        });

        this.deformableParticles.forEach(deformableParticle => {
            this.spatialHashGrid.insertParticle(deformableParticle);
        });

        this.spatialHashGrid.createCollisions();
    }
    update(){
        //this.bodyParticleInteraction();
        this.handleCollisions();
        this.computeRestImpulse();
        this.applyWarmStart();
        this.applyImpulses();
        this.computeNewState();
        this.computeData();
    }

    // Factory methods
    createParticleBoundingBoxConstraint(particle, boundingBox, stiffness, damping, friction){
        const particleBoundingBoxConstraint = new ParticleBoundingBoxConstraint(particle, boundingBox, stiffness, damping, friction);
        particleBoundingBoxConstraint.objectId = this.objectIdCounter++;
        this.particleBoundingBoxConstraints.push(particleBoundingBoxConstraint);
        return this.particleBoundingBoxConstraints[this.particleBoundingBoxConstraints.length - 1];
    }
    deleteParticleBoundingBoxConstraint(particleBoundingBoxConstraint){
        const index = this.particleBoundingBoxConstraints.indexOf(particleBoundingBoxConstraint);
        if (index > -1) {
            this.particleBoundingBoxConstraints.splice(index, 1);
        }
    }
    createSoftBody(position) {
        const softBody = new SoftBody(position);
        softBody.objectId = this.objectIdCounter++;
        this.softBodys.push(softBody);
        return softBody;
    }
    deleteSoftBody(softBody) {
        const index = this.softBodys.indexOf(softBody);
        if (index > -1) {
            this.softBodys.splice(index, 1);
        }
    }
    // createShapeMatchingBody(position, mass){
    //     const shapeMatchingBody = new ShapeMatchingBody(position, mass);
    //     shapeMatchingBody.objectId = this.objectIdCounter++;
    //     this.shapeMatchingBodys.push(shapeMatchingBody);
    //     return shapeMatchingBody;
    // }
    // deleteShapeMatchingBody(shapeMatchingBody){
    //     const index = this.shapeMatchingBodys.indexOf(shapeMatchingBody);
    //     if (index > -1) {
    //         this.shapeMatchingBodys.splice(index, 1);
    //     }
    // }
    createPoint(position) {
        const point = new Point(position);
        point.objectId = this.objectIdCounter++;
        this.points.push(point);
        return point;
    }
    deletePoint(point) {
        this.points.splice(this.points.indexOf(point), 1);
    }
    createLineSegment(pointA, pointB) {
        const lineSegment = new LineSegment(pointA, pointB);
        lineSegment.objectId = this.objectIdCounter++;
        this.lineSegments.push(lineSegment);
        return lineSegment;
    }
    deleteLineSegment(lineSegment) {
        this.lineSegments.splice(this.lineSegments.indexOf(lineSegment), 1);
    }
    createLinearState(position, mass){
        const linearState = new LinearState(position, mass);
        linearState.objectId = this.objectIdCounter++;
        this.linearStates.push(linearState);
        return this.linearStates[this.linearStates.length - 1];
    }
    deleteLinearState(linearState){
        const index = this.linearStates.indexOf(linearState);
        if (index > -1) {
            this.linearStates.splice(index, 1);
        }
    }
    createAngularState(position, mass, angle, inertia){
        const angularState = new AngularState(position, mass, angle, inertia);
        angularState.objectId = this.objectIdCounter++;
        this.angularStates.push(angularState);
        return this.angularStates[this.angularStates.length - 1];
    }
    deleteAngularState(angularState){
        const index = this.angularStates.indexOf(angularState);
        if (index > -1) {
            this.angularStates.splice(index, 1);
        }
    }
    createLinearLink(linearStateA, linearStateB){
        const linearLink = new LinearLink(linearStateA, linearStateB);
        linearLink.objectId = this.objectIdCounter++;
        this.linearLinks.push(linearLink);
        return this.linearLinks[this.linearLinks.length - 1];
    }
    deleteLinearLink(linearLink){
        const index = this.linearLinks.indexOf(linearLink);
        if (index > -1) {
            this.linearLinks.splice(index, 1);
        }
    }
    createFixedSpring(linearStateA, linearStateB, stiffness, damping, warmstart){
        const fixedSpring = new FixedSpring(linearStateA, linearStateB, stiffness, damping, warmstart);
        fixedSpring.objectId = this.objectIdCounter++;
        this.fixedSprings.push(fixedSpring);
        return this.fixedSprings[this.fixedSprings.length - 1];
    }
    deleteFixedSpring(fixedSpring){
        const index = this.fixedSprings.indexOf(fixedSpring);
        if (index > -1) {
            this.fixedSprings.splice(index, 1);
        }
    }
    createLinearSpring(linearStateA, linearStateB, stiffness, damping, warmstart){
        const linearSpring = new LinearSpring(linearStateA, linearStateB, stiffness, damping, warmstart);
        linearSpring.objectId = this.objectIdCounter++;
        this.linearSprings.push(linearSpring);
        return this.linearSprings[this.linearSprings.length - 1];
    }
    deleteLinearSpring(linearSpring){
        const index = this.linearSprings.indexOf(linearSpring);
        if (index > -1) {
            this.linearSprings.splice(index, 1);
        }
    }
    // createDeformableSpring(linearStateA, linearStateB, stiffness, damping, warmstart, restLength){
    //     const deformableSpring = new DeformableSpring(linearStateA, linearStateB, stiffness, damping, warmstart, restLength);
    //     deformableSpring.objectId = this.objectIdCounter++;
    //     this.deformableSprings.push(deformableSpring);
    //     return this.deformableSprings[this.deformableSprings.length - 1];
    // }
    // deleteDeformableSpring(deformableSpring){
    //     const index = this.deformableSprings.indexOf(deformableSpring);
    //     if (index > -1) {
    //         this.deformableSprings.splice(index, 1);
    //     }
    // }
    createAngularSpring(LinearLinkA, linearLinkB, stiffness, damping, warmstart){
        const angularSpring = new AngularSpring(LinearLinkA, linearLinkB, stiffness, damping, warmstart);
        angularSpring.objectId = this.objectIdCounter++;
        this.angularSprings.push(angularSpring);
        return this.angularSprings[this.angularSprings.length - 1];
    }
    deleteAngularSpring(angularSpring){
        const index = this.angularSprings.indexOf(angularSpring);
        if (index > -1) {
            this.angularSprings.splice(index, 1);
        }
    }
    createFluidConstraint(linearStateA, linearStateB){
        const fluidConstraint = new FluidConstraint(linearStateA, linearStateB);
        fluidConstraint.objectId = this.objectIdCounter++;
        this.fluidConstraints.set(fluidConstraint.objectId, fluidConstraint);
        return fluidConstraint;
    }
    deleteFluidConstraint(fluidConstraint){
        return this.fluidConstraints.delete(fluidConstraint.objectId);
    }
    createVolumeConstraint(linearStates){
        const volumeConstraint = new VolumeConstraint(linearStates);
        volumeConstraint.objectId = this.objectIdCounter++;
        this.volumeConstraints.push(volumeConstraint);
        return this.volumeConstraints[this.volumeConstraints.length - 1];
    }
    deleteVolumeConstraint(volumeConstraint){
        const index = this.volumeConstraints.indexOf(volumeConstraint);
        if (index > -1) {
            this.volumeConstraints.splice(index, 1);
        }
    }
    createGearConstraint(angularStateA, angularStateB, gearRatio){
        const gearConstraintParams = {
            angularStateA : angularStateA,
            angularStateB : angularStateB,
            gearRatio : gearRatio
        }
        const gearConstraint = new GearConstraint(gearConstraintParams);
        gearConstraint.objectId = this.objectIdCounter++;
        this.gearConstraints.push(gearConstraint);
        return this.gearConstraints[this.gearConstraints.length - 1];
    }
    deleteGearConstraint(gearConstraint){
        const index = this.gearConstraints.indexOf(gearConstraint);
        if (index > -1) {
            this.gearConstraints.splice(index, 1);
        }
    }
    createMotorConstraint(angularStateA, angularStateB, restVelocity){
        const motorConstraintParams = {
            angularStateA : angularStateA,
            angularStateB : angularStateB,
            restVelocity : restVelocity
        }
        const motorConstraint = new MotorConstraint(motorConstraintParams);
        motorConstraint.objectId = this.objectIdCounter++;
        this.motorConstraints.push(motorConstraint);
        return this.motorConstraints[this.motorConstraints.length - 1];
    }
    deleteMotorConstraint(motorConstraint){
        const index = this.motorConstraints.indexOf(motorConstraint);
        if (index > -1) {
            this.motorConstraints.splice(index, 1);
        }
    }
    createLinearMotorConstraint(linearStateA, linearStateB, restVelocity, stiffness, damping, warmStart){
        const linearMotorConstraint = new LinearMotorConstraint(linearStateA, linearStateB, restVelocity, stiffness, damping, warmStart);
        linearMotorConstraint.objectId = this.objectIdCounter++;
        this.linearMotorConstraints.push(linearMotorConstraint);
        return this.linearMotorConstraints[this.linearMotorConstraints.length - 1];
    }
    deleteLinearMotorConstraint(linearMotorConstraint){
        const index = this.linearMotorConstraints.indexOf(linearMotorConstraint);
        if (index > -1) {
            this.linearMotorConstraints.splice(index, 1);
        }
    }
    createAerodynamicConstraint(params = {}){
        let aerodynamicConstraint = new AerodynamicConstraint(params);
        aerodynamicConstraint.objectId = this.objectIdCounter++;
        this.aerodynamicConstraints.push(aerodynamicConstraint);
        return this.aerodynamicConstraints[this.aerodynamicConstraints.length - 1];
    }
    deleteAerodynamicConstraint(aerodynamicConstraint){
        let index = this.aerodynamicConstraints.indexOf(aerodynamicConstraint);
        if (index > -1) {
            this.aerodynamicConstraints.splice(index, 1);
        }
    }
    createParticle(position, mass, radius, color){
        const particle = new Particle(position, mass, radius, color);
        particle.objectId = this.objectIdCounter++;
        this.particles.push(particle);
        return this.particles[this.particles.length - 1];
    }
    deleteParticle(particle){
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }
    createFluidParticle(position, mass, radius, color){
        const fluidParticle = new FluidParticle(position, mass, radius, color);
        fluidParticle.objectId = this.objectIdCounter++;
        this.fluidParticles.push(fluidParticle);
        return this.fluidParticles[this.fluidParticles.length - 1];
    }
    deleteFluidParticle(fluidParticle){
        const index = this.fluidParticles.indexOf(fluidParticle);
        if (index > -1) {
            this.fluidParticles.splice(index, 1);
        }
    }
    createDeformableParticle(position, mass, radius, color){
        const deformableParticle = new DeformableParticle(position, mass, radius, color);
        deformableParticle.objectId = this.objectIdCounter++;
        this.deformableParticles.push(deformableParticle);
        return this.deformableParticles[this.deformableParticles.length - 1];
    }
    deleteDeformableParticle(deformableParticle){
        const index = this.deformableParticles.indexOf(deformableParticle);
        if (index > -1) {
            this.deformableParticles.splice(index, 1);
        }
    }
    createWheel(position, mass, angle, inertia, radius){
        const wheel = new Wheel(position, mass, angle, inertia, radius);
        wheel.objectId = this.objectIdCounter++;
        this.wheels.push(wheel);
        return this.wheels[this.wheels.length - 1];
    }
    deleteWheel(wheel){
        const index = this.wheels.indexOf(wheel);
        if (index > -1) {
            this.wheels.splice(index, 1);
        }
    }
    createWorldBorderConstraint(objectArray, minX, maxX, minY, maxY, stiffness, damping, friction){
        const worldBorderConstraint = new WorldBorderConstraint(objectArray, minX, maxX, minY, maxY, stiffness, damping, friction);
        worldBorderConstraint.objectId = this.objectIdCounter++;
        this.worldBorderConstraints.push(worldBorderConstraint);
        return this.worldBorderConstraints[this.worldBorderConstraints.length - 1];
    }
    deleteWorldBorderConstraint(worldBorderConstraint){
        const index = this.worldBorderConstraints.indexOf(worldBorderConstraint);
        if (index > -1) {
            this.worldBorderConstraints.splice(index, 1);
        }
    }
};

export { World };