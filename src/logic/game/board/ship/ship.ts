type ShipType = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
type Orientation = "NS" | "EW";

class ShipPart {
  private _damaged: boolean;
  parent: Ship;
  partNum: number;
  constructor(parent: Ship, partNum: number) {
    this.parent = parent;
    this._damaged = false;
    this.partNum = partNum;
  }
  get damaged(): boolean {
    return this._damaged;
  }
  set damaged(bool: boolean) {
    if (bool && !this._damaged) {
      this._damaged = true;
      this.parent.incrementDamagedParts();
    }
  }
}

class Ship {
  shipType: ShipType;
  damagedParts: number;
  parts: Array<ShipPart>;
  constructor(shipType: ShipType) {
    this.damagedParts = 0;
    this.parts = [];
    this.shipType = shipType;
    switch (shipType) {
      case "carrier": {
        this.#addParts(5);
        break;
      }
      case "battleship": {
        this.#addParts(4);
        break;
      }
      case "cruiser": {
        this.#addParts(3);
        break;
      }
      case "submarine": {
        this.#addParts(3);
        break;
      }
      case "destroyer": {
        this.#addParts(2);
        break;
      }
    }
  }
  #addParts(numParts: number) {
    for (let i = 0; i < numParts; i++) {
      this.parts.push(new ShipPart(this, i));
    }
  }
  isAfloat(): boolean {
    return !(this.damagedParts === this.parts.length);
  }
  incrementDamagedParts(): void {
    this.damagedParts++;
  }
}

export { Ship, ShipPart, ShipType, Orientation };
export default Ship;
