"use strict";

import { constants} from './constants.js'
import { Vector2 } from '../../vector-library/version-01/vector2.js'
import { Point } from './point.js'
import { LineSegment } from './lineSegment.js'
import { LinearState } from './linearState.js'
import { AngularState } from './angularState.js'
import { Particle } from './particle.js'
import { LinearLink } from './linearLink.js'
import { LinearSpring } from './linearSpring.js'
import { FixedSpring } from './fixedSpring.js';
import { AngularSpring } from './angularSpring.js'
import { GearConstraint } from './constraints/gearConstraint.js'
import { CollisionHandler } from './collision/collisionHandler.js'
import { Wheel } from './wheel.js'

class World {
    constructor(params = {}){
        this.points = [];
        this.lineSegments = [];
        this.linearStates = [];
        this.angularStates = [];
        this.linearLinks = [];
        this.fixedSprings = [];
        this.linearSprings = [];
        this.angularSprings = [];
        this.gearConstraints = [];
        this.particles = [];
        this.wheels = [];
        this.collisions = new Map();
        this.objectIdCounter = 0;
        this.collisionHandler = new CollisionHandler(this);
    }
    reset() {
        this.points = [];
        this.lineSegments = [];
        this.linearStates = [];
        this.angularStates = [];
        this.linearLinks = [];
        this.fixedSprings = [];
        this.linearSprings = [];
        this.angularSprings = [];
        this.gearConstraints = [];
        this.particles = [];
        this.wheels = [];
        this.collisions = new Map();
        this.objectIdCounter = 0;
        this.collisionHandler = new CollisionHandler(this);
    }
    applyImpulses(){
        for(var i = 0; i < constants.NUM_ITERATIONS; i++){
            this.applyCorrectiveImpulsestoArray(this.angularSprings);
            this.applyCorrectiveImpulsestoArray(this.linearSprings);
            this.applyCorrectiveImpulsestoArray(this.fixedSprings);
            this.applyCorrectiveImpulsestoArray(this.gearConstraints);
            this.applyCorrectiveImpulsesToMap(this.collisions);
        }
    }
    applyCorrectiveImpulsestoArray(array) {
        for(var j = 0; j < array.length; j++) {
            array[j].applyCorrectiveImpulse();
        }
    }
    applyCorrectiveImpulsesToMap(map) {
        const keys = Array.from(map.keys());
        for(var j = 0; j < keys.length; j++) {
            map.get(keys[j]).applyCorrectiveImpulse();
        }
    }
    applyWarmStart(){
        this.angularSprings.forEach(a => { a.applyWarmStart() });
        this.linearSprings.forEach(l => { l.applyWarmStart() });
        this.fixedSprings.forEach(f => { f.applyWarmStart() });
        this.gearConstraints.forEach(g => { g.applyWarmStart() });
        this.collisions.forEach(c => { c.applyWarmStart() });
    }
    computeData(){
        this.linearSprings.forEach(l => { l.computeData() });
        this.fixedSprings.forEach(f => { f.computeData() });
        this.angularSprings.forEach(a => { a.computeData() });
    }
    computeNewState(){
        this.linearStates.forEach(l => {l.computeNewState()});
        this.angularStates.forEach(a => {a.computeNewState()});
        this.particles.forEach(p => {p.computeNewState()});
        this.wheels.forEach(w => {w.computeNewState()});
    }
    computeRestImpulse(){
        this.angularSprings.forEach(a => { a.computeRestImpulse() });
        this.linearSprings.forEach(l => { l.computeRestImpulse() });
        this.fixedSprings.forEach(f => { f.computeRestImpulse() });
        this.gearConstraints.forEach(g => { g.computeRestImpulse() });
        this.collisions.forEach(c => { c.computeRestImpulse() });
    }
    update(){
        // Gravity
        this.linearStates.forEach(l => { l.addImpulse(constants.GRAVITY)});
        this.angularStates.forEach(a => { a.addImpulse(constants.GRAVITY)});
        this.particles.forEach(p => { p.addImpulse(constants.GRAVITY)});
        this.wheels.forEach(w => { w.addImpulse(constants.GRAVITY)});
        
        // Collision detection and creation
        for (let i = 0; i < this.lineSegments.length; i++) {
            
            for (let j = 0; j < this.particles.length; j++) {
                this.collisionHandler.lineSegmentParticleCollision(this.lineSegments[i], this.particles[j]);
            }

            for (let j = 0; j < this.wheels.length; j++) {
                this.collisionHandler.lineSegmentWheelCollision(this.lineSegments[i], this.wheels[j]);
            }

            // for (let j = 0; j < this.linearSprings.length; j++) {
            //     this.collisionHandler.lineSegmentLinearSpringCollision(this.lineSegments[i], this.linearSprings[j]);
            // }

        }

        // for (let i = 0; i < this.particles.length - 1; i++) {
        //     for (let j = i + 1; j < this.particles.length; j++) {
        //         this.collisionHandler.particleParticleCollision(this.particles[i], this.particles[j]);
        //     }
        // }

        this.computeRestImpulse();
        this.applyWarmStart();
        this.applyImpulses();
        this.computeNewState();
        this.computeData();
    }
    // Factory methods
    createPoint(position) {
        let point = new Point(position);
        point.objectId = this.objectIdCounter++;
        this.points.push(point);
        return point;
    }
    deletePoint(point) {
        this.points.splice(this.points.indexOf(point), 1);
    }
    createLineSegment(pointA, pointB) {
        let lineSegment = new LineSegment(pointA, pointB);
        lineSegment.objectId = this.objectIdCounter++;
        this.lineSegments.push(lineSegment);
        return lineSegment;
    }
    deleteLineSegment(lineSegment) {
        this.lineSegments.splice(this.lineSegments.indexOf(lineSegment), 1);
    }
    createLinearState(position, mass){
        var linearState = new LinearState(position, mass);
        linearState.objectId = this.objectIdCounter++;
        this.linearStates.push(linearState);
        return this.linearStates[this.linearStates.length - 1];
    }
    deleteLinearState(linearState){
        var index = this.linearStates.indexOf(linearState);
        if (index > -1) {
            this.linearStates.splice(index, 1);
        }
    }
    createAngularState(position, mass, angle, inertia){
        var angularState = new AngularState(position, mass, angle, inertia);
        angularState.objectId = this.objectIdCounter++;
        this.angularStates.push(angularState);
        return this.angularStates[this.angularStates.length - 1];
    }
    deleteAngularState(angularState){
        var index = this.angularStates.indexOf(angularState);
        if (index > -1) {
            this.angularStates.splice(index, 1);
        }
    }
    createLinearLink(linearStateA, linearStateB){
        var linearLink = new LinearLink(linearStateA, linearStateB);
        linearLink.objectId = this.objectIdCounter++;
        this.linearLinks.push(linearLink);
        return this.linearLinks[this.linearLinks.length - 1];
    }
    deleteLinearLink(linearLink){
        var index = this.linearLinks.indexOf(linearLink);
        if (index > -1) {
            this.linearLinks.splice(index, 1);
        }
    }
    createFixedSpring(linearStateA, linearStateB, stiffness, damping, warmstart){
        var fixedSpring = new FixedSpring(linearStateA, linearStateB, stiffness, damping, warmstart);
        fixedSpring.objectId = this.objectIdCounter++;
        this.fixedSprings.push(fixedSpring);
        return this.fixedSprings[this.fixedSprings.length - 1];
    }
    deleteFixedSpring(fixedSpring){
        var index = this.fixedSprings.indexOf(fixedSpring);
        if (index > -1) {
            this.fixedSprings.splice(index, 1);
        }
    }
    createLinearSpring(linearStateA, linearStateB, stiffness, damping, warmstart){
        var linearSpring = new LinearSpring(linearStateA, linearStateB, stiffness, damping, warmstart);
        linearSpring.objectId = this.objectIdCounter++;
        this.linearSprings.push(linearSpring);
        return this.linearSprings[this.linearSprings.length - 1];
    }
    deleteLinearSpring(linearSpring){
        var index = this.linearSprings.indexOf(linearSpring);
        if (index > -1) {
            this.linearSprings.splice(index, 1);
        }
    }
    createAngularSpring(LinearLinkA, linearLinkB, stiffness, damping, warmstart){
        var angularSpring = new AngularSpring(LinearLinkA, linearLinkB, stiffness, damping, warmstart);
        angularSpring.objectId = this.objectIdCounter++;
        this.angularSprings.push(angularSpring);
        return this.angularSprings[this.angularSprings.length - 1];
    }
    deleteAngularSpring(angularSpring){
        var index = this.angularSprings.indexOf(angularSpring);
        if (index > -1) {
            this.angularSprings.splice(index, 1);
        }
    }
    createGearConstraint(angularStateA, angularStateB, gearRatio){
        var gearConstraintParams = {
            angularStateA : angularStateA,
            angularStateB : angularStateB,
            gearRatio : gearRatio
        }
        var gearConstraint = new GearConstraint(gearConstraintParams);
        gearConstraint.objectId = this.objectIdCounter++;
        this.gearConstraints.push(gearConstraint);
        return this.gearConstraints[this.gearConstraints.length - 1];
    }
    deleteGearConstraint(gearConstraint){
        var index = this.gearConstraints.indexOf(gearConstraint);
        if (index > -1) {
            this.gearConstraints.splice(index, 1);
        }
    }
    createParticle(position, mass, radius, color){
        var particle = new Particle(position, mass, radius, color);
        particle.objectId = this.objectIdCounter++;
        this.particles.push(particle);
        return this.particles[this.particles.length - 1];
    }
    deleteParticle(particle){
        var index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }
    createWheel(position, mass, angle, inertia, radius){
        var wheel = new Wheel(position, mass, angle, inertia, radius);
        wheel.objectId = this.objectIdCounter++;
        this.wheels.push(wheel);
        return this.wheels[this.wheels.length - 1];
    }
    deleteWheel(wheel){
        var index = this.wheels.indexOf(wheel);
        if (index > -1) {
            this.wheels.splice(index, 1);
        }
    }
};

export { World };