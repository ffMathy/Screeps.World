import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class ClaimCreepStrategy implements CreepStrategy {
  get name() {
    return "claim";
  }

  constructor(
    private readonly creep:CreepDecorator) {
  }

  tick() {
    var creep=this.creep;
    let controller = creep.creep.room.controller;
    let claimResult = creep.creep.claimController(controller);
    if(claimResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
      return void 0;
    } else if(claimResult === ERR_INVALID_TARGET) {
      creep.creep.suicide();
      return void 0;
    } else if(claimResult !== OK) {
      throw new Error('Invalid claim result: ' + claimResult);
    }
  }
}
