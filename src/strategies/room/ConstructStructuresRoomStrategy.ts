import RoomDecorator, { RoomStrategy } from '../../RoomDecorator';
import StrategyPickingRoomStrategy from './StrategyPickingRoomStrategy';
import Coordinates from 'helpers/Coordinates';
// import Coordinates from 'helpers/Coordinates';

export default class ConstructStructuresRoomStrategy implements RoomStrategy {
  get name() {
    return "build";
  }

  constructor(private readonly room: RoomDecorator) {}

  tick() {
    let room = this.room;
    if(!room.room || !room.room.controller || !room.room.controller.my)
      return;

    this.buildSpiralStructures();

    room.refresh();
    room.setStrategy(new StrategyPickingRoomStrategy(room));
  }

  private buildSpiralStructures() {
    let room = this.room;

    let rawStructures = (room.room.find(FIND_STRUCTURES) as Structure[]) || [];
    let structures = rawStructures.filter(x => x.structureType !== STRUCTURE_ROAD);

    let typesToBuild = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
    let roomControllerLevel = room.room.controller ? room.room.controller.level : 0;
    for(let typeToBuild of typesToBuild) {
      const structuresOfType = structures.filter(s => s.structureType === typeToBuild);
      const constructionSitesOfType = room.constructionSites.filter(x => x.structureType === typeToBuild);

      let totalAvailable = 0;
      for(let level in CONTROLLER_STRUCTURES[typeToBuild]) {
        if(+level > roomControllerLevel)
          break;

        totalAvailable = +CONTROLLER_STRUCTURES[typeToBuild][level];
      }

      let countBuilt = structuresOfType.length + constructionSitesOfType.length;

      let offset = countBuilt + (countBuilt % 3) - 1 + 48;
      while(countBuilt < totalAvailable) {
        let currentOffset = offset;

        let position = Coordinates.calculateSpiralOffset(currentOffset);
        position.x += room.room.controller.pos.x;
        position.y += room.room.controller.pos.y;

        offset += 3;

        let isWalkable = room.terrain.getTileAt(position.x, position.y).isWalkable;
        if(!isWalkable)
          continue;

        let roomPosition = room.room.getPositionAt(position.x, position.y);
        countBuilt += room.createConstructionSites([roomPosition], typeToBuild);
      }
    }
  }
}
