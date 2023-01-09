import { ShipPart } from './ship/ship';
import Tile from './tile/tile';
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
	#getTile(x: number, y: number): Tile {
		return this._tiles[x][y];
	}
	getTargeted(x: number, y: number): boolean {
		return this.#getTile(x,y).targeted;
	}
	getOccupied(x: number, y: number): ShipPart | null {
		return this.#getTile(x,y).occupiedBy;
	}
}

export {Board};
export default Board;
