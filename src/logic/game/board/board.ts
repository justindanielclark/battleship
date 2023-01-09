import { ShipPart } from './ship/ship';
import Tile from './tile/tile';
import Point from '../_shared/Point';

class Board {
	private _tiles: Array<Array<Tile>>;
	constructor(xSize: number, ySize: number){
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
	getTargeted(point: Point): boolean {
		return this.#getTile(point).targeted;
	}
	getOccupied(point: Point): ShipPart | null {
		return this.#getTile(point).occupiedBy;
	}
}

export {Board};
export default Board;
