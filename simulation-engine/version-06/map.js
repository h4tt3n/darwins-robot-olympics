"use strict";

/*
    This class contains all functions and variables responsible for
    creating the physical map or level that the robots will navigate around in.

    This does not include the waypoints that the robots will navigate between.

*/

class Map {
    constructor(params = {}) {
        this.params = Object.freeze(params);
        this.points = [];
        this.lineSegments = [];
    }
};

export { Map };