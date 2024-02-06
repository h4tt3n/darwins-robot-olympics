"use strict";

import { BT } from "../../behavior-tree/version-01/bT.js";
import { ReturnSuccess } from "../../behavior-tree/version-01/moduleBundler.js";

class Entity {
    constructor() {
        this.name = "Entity";
    }
}

var entity = new Entity();

var node = BT.BehaviorTreeFactory.repeater( 
    BT.BehaviorTreeFactory.serialiser(
        BT.BehaviorTreeFactory.action(new ReturnSuccess()),
        BT.BehaviorTreeFactory.action(new ReturnSuccess()),
        BT.BehaviorTreeFactory.action(new ReturnSuccess())
    )
);

var bTree = new BT.BehaviorTree(entity, node);

bTree.evaluate();