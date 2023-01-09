import {ShipPart} from '../ship/ship';

class Tile {
	occupiedBy: null | ShipPart;
	targeted: boolean;
	constructor(){
		this.occupiedBy = null;
		this.targeted = false;
	}
}

export {Tile};
export default Tile;