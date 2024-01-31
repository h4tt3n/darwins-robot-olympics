"use strict";

import { BT } from "../../behavior-tree/version-01/bT.js";
import { ReturnSuccess } from "../../behavior-tree/version-01/moduleBundler.js";

var node = BT.BehaviorTreeFactory.serialiser(
    BT.BehaviorTreeFactory.action(
        new ReturnSuccess(),
        new ReturnSuccess(),
        new ReturnSuccess()
    ),
);

var bTree = new BT.BehaviorTree(node);

bTree.evaluate();