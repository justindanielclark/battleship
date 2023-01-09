class ShipPart {
	private _parent: Ship;
	private _damaged: boolean;
	constructor(parent: Ship){
		this._parent = parent;
		this._damaged = false;
	}
	get damaged(): boolean {
		return this._damaged;
	}
	set damaged(bool: boolean){
		if(bool && !this._damaged){
			this._damaged = true;
			this._parent.incrementDamagedParts();
		}
	}
}

class Ship {
	damagedParts: number;
	parts: Array<ShipPart>;
	constructor(
		shipType: 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer',
	){
		this.damagedParts = 0;
		this.parts = [];

		switch(shipType){
			case 'carrier': {
				this.#addParts(5);
				break;
			}
			case 'battleship': {
				this.#addParts(4);
				break;
			}
			case 'cruiser': {
				this.#addParts(3);
				break;
			}
			case 'submarine': {
				this.#addParts(3);
				break;
			}
			case 'destroyer': {
				this.#addParts(2);
				break;
			}
		}
	}
	#addParts(numParts: number){
		for(let i = 0; i < numParts; i++){
			this.parts.push(new ShipPart(this));
		}
	}
	isAfloat(): boolean{
		return !(this.damagedParts === this.parts.length);
	}
	incrementDamagedParts(): void {
		this.damagedParts++;
	}
}

export {Ship, ShipPart};
export default Ship;