import RoomDecorator from 'RoomDecorator';
import GameDecorator from 'GameDecorator';
import { CreepStrategy } from 'strategies/Strategy';

export interface CreepMemory {
  reservationId: string;
}

export default class CreepDecorator {
  public room: RoomDecorator;

  private strategy: CreepStrategy;
  private lastStrategyTick: number;
  private lastPosition: RoomPosition;

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep)
  {
    this.room = game.rooms.fromCreep(creep);
    this.room.creeps.add(this);
    this.strategy = null;
  }

  moveTo(target: RoomPosition | { pos: RoomPosition; }, opts?: MoveToOpts) {
    if(!opts)
      opts = {};

    opts.visualizePathStyle = { stroke: '#ffffff' };

    // let game = GameDecorator.instance;
    opts.reusePath = 10; //game.usedCpu < game.availableCpu / 2 ? 25 : 1;

    return this.creep.moveTo(target, opts);
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
    this.lastStrategyTick = this.game.tickCount;
    this.creep.memory.strategy = strategy.name;
  }

  updateRoom() {
    this.room.creeps.remove(this);
    this.room = this.game.rooms.fromCreep(this.creep);
    this.room.creeps.add(this);
  }

  say(message: string, toPublic?: boolean): number {
    try {
      return this.creep.say(message, toPublic);
    } catch(e) {
      //ignore errors due to 500kb size limit.
    }
  }

  tick() {
    const oldCreep = this.creep;
    if(this.creep)
      this.creep = Game.creeps[this.creep.name];

    if(!this.creep || oldCreep.ticksToLive <= 3) {
      this.game.resources.unreserve(oldCreep);
      this.room.creeps.remove(this);
      return;
    }

    if(this.strategy) {
      if(this.creep.room.name !== oldCreep.room.name)
        this.updateRoom();

      if(!this.lastPosition)
        this.lastPosition = this.creep.pos;

      let strategyTickDifference = this.game.tickCount - this.lastStrategyTick;
      if(strategyTickDifference < 5)
        this.say(this.strategy.name, true);

      if(this.lastPosition.x !== this.creep.pos.x || this.lastPosition.y !== this.creep.pos.y)
        this.room.terrain.increaseTilePopularity(this.creep.pos.x, this.creep.pos.y);

      this.strategy.tick();
    }
  }
}
