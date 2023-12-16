"use strict";

import { Vector2 } from '../../vector-library/version-01/vector2.js'

// This Camera class is for showing context on the canvas.
class Camera {
    constructor(posX, posY, zoom){
        this.zoom = zoom;
        this.angle = 0.0;
        this.maxZoom = 1.0;
        this.minZoom = 0.1;
        this.deltaPan = 0.1;
        this.deltaZoom = 0.1;
        this.restZoom = 1.0;
        this.position = new Vector2(posX, posY);
        this.restPosition = new Vector2(posX, posY);
    }
    update() {
        // Position
        this.position = this.position.add(this.restPosition.sub(this.position).mul(this.deltaPan));
        
        // Zoom
        if(this.restZoom > this.maxZoom) {this.restZoom = this.maxZoom};
        if(this.restZoom < this.minZoom) {this.restZoom = this.minZoom};
        this.zoom += ( this.restZoom - this.zoom ) * this.deltaZoom;
    }
};

export { Camera };