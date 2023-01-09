import {Ship, ShipPart, Orientation} from './ship/ship';
import Tile from './tile/tile';
import Point from '../_shared/Point';

class Board {
	private _tiles: Array<Array<Tile>>;
	private _xSize: number;
	private _ySize: number;
	constructor(xSize: number, ySize: number){
		this._xSize = xSize;
		this._ySize = ySize;
		this._tiles = [];
		for(let x = 0; x < xSize; x++){
			this._tiles[x] = [];
			for(let y = 0; y < ySize; y++){
				this._tiles[x][y] = new Tile();
			}
		}
	}
	#getTile(point: Point): Tile {
		return this._tiles[point.x][point.y];
	}
	#isWithinValidBounds(point: Point): boolean {
		return !(point.x < 0 || point.x >= this._xSize || point.y < 0 || point.y >= this._ySize);
	}
	getTargeted(point: Point): boolean {
		return this.#getTile(point).targeted;
	}
	getOccupied(point: Point): ShipPart | null {
		return this.#getTile(point).occupiedBy;
	}
	isValidPlacementLocation(startingLoc: Point, ship: Ship, orientation: Orientation): boolean {
		let i = 0;
		let isValid = true;
		const point = startingLoc.deepCopy();
		const shipLength = ship.parts.length;
		while(isValid && i < shipLength){
			isValid = this.#isWithinValidBounds(point);
			if(orientation === 'NS'){
				point.y++;
			}
			else {
				point.x++;
			}
			i++;
		}
		return isValid;
	}
}

export {Board};
export default Board;
