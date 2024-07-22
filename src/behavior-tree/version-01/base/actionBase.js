"use strict";

import { NodeBase } from "./nodeBase.js";

class ActionBase extends NodeBase {
    constructor() {
        super();
    }
    add(node) {
        return null;
    }
    toString() {
        return super.toString();
    }
};

export { ActionBase };