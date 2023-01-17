import { Ship, ShipPart } from "./Ship";
import Tile from "./Tile";
import Point from "./Point";

class Board {
  private _tiles: Array<Array<Tile>>;
  private _xSize: number;
  private _ySize: number;
  private _fleet: Array<Ship>;
  constructor(xSize: number, ySize: number) {
    this._xSize = xSize;
    this._ySize = ySize;
    this._fleet = [];
    this._tiles = [];
    for (let x = 0; x < xSize; x++) {
      this._tiles[x] = [];
      for (let y = 0; y < ySize; y++) {
        this._tiles[x][y] = new Tile();
      }
    }
  }
  #getTile(point: Point): Tile {
    if (this.#isWithinValidBounds(point)) {
      return this._tiles[point.x][point.y];
    } else {
      throw new Error("Targetting Out of Bounds");
    }
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
    if (this.#isWithinValidBounds(point)) {
      return this.#getTile(point).targeted;
    } else {
      throw new Error("Targetting Out of Bounds");
    }
  }
  target(point: Point): void {
    if (this.#isWithinValidBounds(point)) {
      this.#getTile(point).targeted = true;
      if (this.isOccupied(point)) {
        const occupied = this.getOccupied(point);
        if (occupied) {
          occupied.damaged = true;
        }
      }
    } else {
      throw new Error("Targetting Out of Bounds");
    }
  }
  getOccupied(point: Point): ShipPart | undefined {
    return this.#getTile(point).occupiedBy;
  }
  isOccupied(point: Point): boolean {
    if (this.getOccupied(point)) {
      return true;
    }
    return false;
  }
  isValidPlacementLocation(startingLoc: Point, ship: Ship): boolean {
    let i = 0;
    let isValid = true;
    const point = startingLoc.deepCopy();
    const shipLength = ship.parts.length;
    while (isValid && i < shipLength) {
      isValid = this.#isWithinValidBounds(point);
      if (isValid) {
        isValid = !this.isOccupied(point);
      }
      if (ship.orientation === "NS") {
        point.y += 1;
      } else {
        point.x += 1;
      }
      i++;
    }
    return isValid;
  }
  isAlive(): boolean {
    let deadShips = 0;
    this._fleet.forEach((ship) => {
      if (!ship.isAfloat()) {
        deadShips++;
      }
    });
    return !(deadShips === this._fleet.length);
  }
  addShip(startingLoc: Point, ship: Ship): void {
    const point = startingLoc.deepCopy();
    if (this.isValidPlacementLocation(startingLoc, ship)) {
      this._fleet.push(ship);
      for (let i = 0; i < ship.parts.length; i++) {
        this.#getTile(point).occupiedBy = ship.parts[i];
        if (ship.orientation === "NS") {
          point.y += 1;
        } else {
          point.x += 1;
        }
      }
    }
  }
  reset(): void {
    this._fleet = [];
    this._tiles = [];
    for (let x = 0; x < this._xSize; x++) {
      this._tiles[x] = [];
      for (let y = 0; y < this._ySize; y++) {
        this._tiles[x][y] = new Tile();
      }
    }
  }
}

export { Board };
export default Board;
