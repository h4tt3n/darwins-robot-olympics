"use strict";

import { Vector2 } from '../../../vector-library/version-02/vector2.js'

class Point {
    constructor(position) {
        if (position instanceof Vector2) {
            this.position = position;
        } else {
            this.position = Vector2.zero;
        }
        this.objectId = null;
    }
}

export { Point };