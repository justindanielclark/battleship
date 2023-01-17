import { ShipPart } from "./Ship";

class Tile {
  occupiedBy?: ShipPart;
  targeted: boolean;
  constructor() {
    this.occupiedBy = undefined;
    this.targeted = false;
  }
}

export { Tile };
export default Tile;
