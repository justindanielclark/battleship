class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  deepCopy(): Point {
    return new Point(this.x, this.y);
  }
  isBetween(pointA: Point, pointB: Point): boolean {
    return this.x >= pointA.x && this.x < pointB.x && this.y >= pointA.y && this.y < pointB.y;
  }
  toString(): string {
    return `{x: ${this.x}, y: ${this.y}}`;
  }
  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }
}

export default Point;
