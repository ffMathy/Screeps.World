import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class ParkingCreepStrategy implements CreepStrategy {
  get name() {
    return "park";
  }

  tick(creep: CreepDecorator) {
    creep.park();
  }
}
