"use strict";

import { constants } from './../constants.js';
import { Vector2 } from './vector2.js';
import { AngularState } from './angularState.js';

class Body extends AngularState {
    constructor(args = {}) {
        super(args);
        this.args = args;
        this.objects = new Map();
    }
};

export { Body };

