import Point from "../../_shared/Point";
import { Board } from "../board";
import { Ship } from "../ship/ship";

describe("the board created by new Board", () => {
  test("sees valid locations to add ships", () => {
    const board = new Board(10, 10);
    const carrier = new Ship("carrier");
    const destroyer = new Ship("destroyer");
    const testCases = [
      board.isValidPlacementLocation(new Point(0, 0), carrier, "NS"),
      board.isValidPlacementLocation(new Point(1, 0), carrier, "NS"),
      board.isValidPlacementLocation(new Point(4, 4), carrier, "NS"),
      board.isValidPlacementLocation(new Point(0, 0), carrier, "EW"),
      board.isValidPlacementLocation(new Point(3, 2), carrier, "EW"),
      board.isValidPlacementLocation(new Point(4, 9), carrier, "EW"),
      board.isValidPlacementLocation(new Point(0, 0), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(5, 8), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(3, 2), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(8, 6), destroyer, "EW"),
      board.isValidPlacementLocation(new Point(0, 9), destroyer, "EW"),
      board.isValidPlacementLocation(new Point(8, 9), destroyer, "EW"),
    ];
    expect(testCases[0]).toBe(true);
    expect(testCases[1]).toBe(true);
    expect(testCases[2]).toBe(true);
    expect(testCases[3]).toBe(true);
    expect(testCases[4]).toBe(true);
    expect(testCases[5]).toBe(true);
    expect(testCases[6]).toBe(true);
    expect(testCases[7]).toBe(true);
    expect(testCases[8]).toBe(true);
    expect(testCases[9]).toBe(true);
    expect(testCases[10]).toBe(true);
    expect(testCases[11]).toBe(true);
  });
  test("sees invalid locations to add ships", () => {
    const board = new Board(10, 10);
    const carrier = new Ship("carrier");
    const destroyer = new Ship("destroyer");
    const testCases = [
      board.isValidPlacementLocation(new Point(0, -1), carrier, "NS"),
      board.isValidPlacementLocation(new Point(5, 9), carrier, "NS"),
      board.isValidPlacementLocation(new Point(4, 7), carrier, "NS"),
      board.isValidPlacementLocation(new Point(7, 0), carrier, "EW"),
      board.isValidPlacementLocation(new Point(-1, 9), carrier, "EW"),
      board.isValidPlacementLocation(new Point(6, 9), carrier, "EW"),
      board.isValidPlacementLocation(new Point(-1, -1), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(9, 9), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(5, 10), destroyer, "NS"),
      board.isValidPlacementLocation(new Point(9, 0), destroyer, "EW"),
      board.isValidPlacementLocation(new Point(-1, 5), destroyer, "EW"),
      board.isValidPlacementLocation(new Point(9, 9), destroyer, "EW"),
    ];
    expect(testCases[0]).toBe(false);
    expect(testCases[1]).toBe(false);
    expect(testCases[2]).toBe(false);
    expect(testCases[3]).toBe(false);
    expect(testCases[4]).toBe(false);
    expect(testCases[5]).toBe(false);
    expect(testCases[6]).toBe(false);
    expect(testCases[7]).toBe(false);
    expect(testCases[8]).toBe(false);
    expect(testCases[9]).toBe(false);
    expect(testCases[10]).toBe(false);
    expect(testCases[11]).toBe(false);
  });
  test("can add a ship at a valid location", () => {
    const board = new Board(10, 10);
    const carrier = new Ship("carrier");
    const carrier2 = new Ship("carrier");
    board.addShip(new Point(0, 0), carrier, "NS");
    board.addShip(new Point(1, 0), carrier2, "EW");
    expect(board.getOccupied(new Point(0, 0))).toBe(carrier.parts[0]);
    expect(board.getOccupied(new Point(0, 1))).toBe(carrier.parts[1]);
    expect(board.getOccupied(new Point(0, 2))).toBe(carrier.parts[2]);
    expect(board.getOccupied(new Point(0, 3))).toBe(carrier.parts[3]);
    expect(board.getOccupied(new Point(0, 4))).toBe(carrier.parts[4]);
    expect(board.getOccupied(new Point(1, 0))).toBe(carrier2.parts[0]);
    expect(board.getOccupied(new Point(2, 0))).toBe(carrier2.parts[1]);
    expect(board.getOccupied(new Point(3, 0))).toBe(carrier2.parts[2]);
    expect(board.getOccupied(new Point(4, 0))).toBe(carrier2.parts[3]);
    expect(board.getOccupied(new Point(5, 0))).toBe(carrier2.parts[4]);
  });
  test("will refuse to add a ship to an invalid location", () => {
    const board = new Board(10, 10);
    const carrier = new Ship("carrier");
    const battleship = new Ship("battleship");
    const destroyer = new Ship("destroyer");
    board.addShip(new Point(0, 0), carrier, "NS");
    board.addShip(new Point(0, 0), battleship, "EW");
    board.addShip(new Point(9, 9), destroyer, "NS");
    const testCase = [
      board.getOccupied(new Point(0, 0)),
      board.getOccupied(new Point(1, 0)),
      board.getOccupied(new Point(9, 9)),
    ];
    expect(testCase[0]).toBe(carrier.parts[0]);
    expect(testCase[1]).toBe(null);
    expect(testCase[2]).toBe(null);
  });
});
