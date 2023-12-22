import { constants } from './constants.js';
import { Vector2 } from '../../vector-library/version-01/vector2.js';
import { LinearState } from './linearState.js'

class AngularState extends LinearState {
    constructor(position, mass, angle, inertia){
        super(position, mass);
        this.angle = angle;
        this.angleVector = new Vector2();
        this.angularVelocity = 0.0;
        this.angularVelocityVector = new Vector2();
        this.angularImpulse = 0.0;
        this.inertia = inertia;
        this.inverseInertia = 0.0;
        this.objectId = null;
        this.computeAngleVector();
        this.computeInverseInertia();
    }
    addAngle(angle){
        this.angle += angle;
    }
    addAngleVector(angleVector){
        this.angleVector = this.angleVector.rotate(angleVector);
    }
    addAngularImpulse(angularImpulse){
        this.angularImpulse += angularImpulse;
    }
    addAngularVelocity(angularVelocity){
        this.angularVelocity += angularVelocity;
    }
    applyImpulseAtPoint(impulse, point) {
        if (impulse instanceof Vector2 && point instanceof Vector2) {
            var r = point.sub(this.position);
            var linearImpulse = impulse.mul(this.inverseMass);
            var angularImpulse = r.perpDot(impulse) * this.inverseInertia;
            this.addVelocity(linearImpulse);
            this.addAngularVelocity(angularImpulse);
        }
    }
    getLinearVelocityAtPoint(point) {
        if (point instanceof Vector2) {
            var r = point.sub(this.position);
            return this.velocity.add(r.perp().mul(this.angularVelocity));
        }
        return Vector2.zero;
    }
    computeAngle(){
        this.angle = Math.atan2(this.angleVector.y, this.angleVector.x);
    }
    computeAngleVector(){
        this.angleVector = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
    }
    computeAngularVelocityVector(){
        var deltaAngle = this.angularVelocity * constants.DT;
        this.angularVelocityVector = new Vector2(Math.cos(deltaAngle), Math.sin(deltaAngle));
    }
    computeData(){
        // TODO
    }
    computeInverseInertia(){
        this.inverseInertia = this.inertia > 0.0 ? 1.0 / this.inertia : 0.0;
    }
    computeNewState(){
        
        super.computeNewState();
        
        if( this.invInertia != 0.0){

            this.angularVelocity += this.angularImpulse;
            //this.computeAngularVelocityVector();

            this.angle -= this.angularVelocity * constants.DT;
            this.computeAngleVector(this.angle);
            
        }
        this.angularImpulse = 0.0;
    }
};

export { AngularState };