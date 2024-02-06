"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'

// This Camera class is for showing context on the canvas.
class Camera {
    constructor(posX, posY, zoom = 0.5){
        this.zoom = zoom;
        this.angle = 0.0;
        this.maxZoom = 1.0;
        this.minZoom = 0.25;
        this.minPosition = new Vector2(-4000, -4000);
        this.maxPosition = new Vector2(4000, 4000);
        this.deltaPan = 0.2;
        this.deltaZoom = 0.2;
        this.restZoom = 0.5;
        this.position = new Vector2(posX, posY);
        this.restPosition = new Vector2(posX, posY);
    }
    update() {
        // Position
        this.position = this.position.add(this.restPosition.sub(this.position).mul(this.deltaPan));
        if(this.position.x > this.maxPosition.x) {this.position.x = this.maxPosition.x};
        if(this.position.y > this.maxPosition.y) {this.position.y = this.maxPosition.y};
        if(this.position.x < this.minPosition.x) {this.position.x = this.minPosition.x};
        if(this.position.y < this.minPosition.y) {this.position.y = this.minPosition.y};
        
        // Zoom
        if(this.restZoom > this.maxZoom) {this.restZoom = this.maxZoom};
        if(this.restZoom < this.minZoom) {this.restZoom = this.minZoom};
        this.zoom += ( this.restZoom - this.zoom ) * this.zoom * this.deltaZoom;
    }
};

export { Camera };