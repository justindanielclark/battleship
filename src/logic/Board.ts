import { Ship, ShipPart, Orientation } from "./Ship";
import Tile from "./Tile";
import Point from "./Point";

class Board {
  private _tiles: Array<Array<Tile>>;
  private _xSize: number;
  private _ySize: number;
  constructor(xSize: number, ySize: number) {
    this._xSize = xSize;
    this._ySize = ySize;
    this._tiles = [];
    for (let x = 0; x < xSize; x++) {
      this._tiles[x] = [];
      for (let y = 0; y < ySize; y++) {
        this._tiles[x][y] = new Tile();
      }
    }
  }
  #getTile(point: Point): Tile {
    return this._tiles[point.x][point.y];
  }
  #isWithinValidBounds(point: Point): boolean {
    return !(
      point.x < 0 ||
      point.x >= this._xSize ||
      point.y < 0 ||
      point.y >= this._ySize
    );
  }
  getTargeted(point: Point): boolean {
    return this.#getTile(point).targeted;
  }
  setTargeted(point: Point, bool: boolean): void {
    if (this.#isWithinValidBounds(point)) {
      this.#getTile(point).targeted = bool;
    }
  }
  getOccupied(point: Point): ShipPart | null {
    return this.#getTile(point).occupiedBy;
  }
  isOccupied(point: Point): boolean {
    if (this.getOccupied(point)) {
      return true;
    }
    return false;
  }
  isValidPlacementLocation(
    startingLoc: Point,
    ship: Ship,
    orientation: Orientation
  ): boolean {
    let i = 0;
    let isValid = true;
    const point = startingLoc.deepCopy();
    const shipLength = ship.parts.length;
    while (isValid && i < shipLength) {
      isValid = this.#isWithinValidBounds(point);
      if (isValid) {
        isValid = !this.isOccupied(point);
      }
      if (orientation === "NS") {
        point.y += 1;
      } else {
        point.x += 1;
      }
      i++;
    }
    return isValid;
  }
  addShip(startingLoc: Point, ship: Ship, orientation: Orientation): void {
    const point = startingLoc.deepCopy();
    if (this.isValidPlacementLocation(startingLoc, ship, orientation)) {
      for (let i = 0; i < ship.parts.length; i++) {
        this.#getTile(point).occupiedBy = ship.parts[i];
        if (orientation === "NS") {
          point.y += 1;
        } else {
          point.x += 1;
        }
      }
    }
  }
}

export { Board };
export default Board;
