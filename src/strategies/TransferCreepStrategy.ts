import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class TransferCreepStrategy implements CreepStrategy {
  get name() {
    return "transfer";
  }

  tick(creep: CreepDecorator) {
    let targets = creep.room.getTransferrableStructures();
    if (targets.length > 0) {
      var transferResult = creep.creep.transfer(targets[0], RESOURCE_ENERGY);
      if (transferResult === ERR_NOT_IN_RANGE) {
        creep.creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      creep.setStrategy(new StrategyPickingCreepStrategy());
    }
  }
}
