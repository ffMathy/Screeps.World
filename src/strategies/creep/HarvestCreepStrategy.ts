import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import GameDecorator from "GameDecorator";
import Strategy from "strategies/Strategy";

export default class HarvestCreepStrategy implements Strategy {
  get name() {
    return "harvest";
  }

  constructor(
    private readonly creep: CreepDecorator
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == this.creep.creep.carryCapacity) {
      GameDecorator.instance.resources.unreserve(this.creep);
      return this.creep.setStrategy(new StrategyPickingCreepStrategy(this.creep));
    }

    let sources = this.creep.room.sources;
    let reservedId = this.creep.memory.reservationId;
    let reservedSource: Source = null;
    if(reservedId) {
      reservedSource = sources.filter(x => x.id === reservedId)[0];
    }

    if(!reservedSource) {
      for (let source of sources) {
        if(!GameDecorator.instance.resources.reserve(this.creep, source.id))
          continue;

        reservedSource = source;
        break;
      }
    }

    if (reservedSource) {
      if(this.creep.creep.harvest(reservedSource) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(reservedSource);
      }
    } else {
      GameDecorator.instance.resources.unreserve(this.creep);

      //TODO: handle withdrawal from extension.
      this.creep.setStrategy(new StrategyPickingCreepStrategy(this.creep));
    }
  }
}
