class Point {
	x: number;
	y: number;
	constructor(x: number, y: number){
		this.x = x;
		this.y = y;
	}
	deepCopy(): Point {
		return new Point(this.x, this.y);
	}
}

export default Point;