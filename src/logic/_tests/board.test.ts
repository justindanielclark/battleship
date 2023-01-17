import Point from "../data_storage/Point";
import { Board } from "../data_storage/Board";
import { Ship } from "../data_storage/Ship";

describe("the board created by new Board", () => {
  test("sees valid locations to add ships", () => {
    const board = new Board(10, 10);
    const carrierNS = new Ship("carrier", "NS");
    const carrierEW = new Ship("carrier", "EW");
    const destroyerNS = new Ship("destroyer", "NS");
    const destroyerEW = new Ship("destroyer", "EW");
    const testCases = [
      board.isValidPlacementLocation(new Point(0, 0), carrierNS),
      board.isValidPlacementLocation(new Point(1, 0), carrierNS),
      board.isValidPlacementLocation(new Point(4, 4), carrierNS),
      board.isValidPlacementLocation(new Point(0, 0), carrierEW),
      board.isValidPlacementLocation(new Point(3, 2), carrierEW),
      board.isValidPlacementLocation(new Point(4, 9), carrierEW),
      board.isValidPlacementLocation(new Point(0, 0), destroyerNS),
      board.isValidPlacementLocation(new Point(5, 8), destroyerNS),
      board.isValidPlacementLocation(new Point(3, 2), destroyerNS),
      board.isValidPlacementLocation(new Point(8, 6), destroyerEW),
      board.isValidPlacementLocation(new Point(0, 9), destroyerEW),
      board.isValidPlacementLocation(new Point(8, 9), destroyerEW),
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
    const carrierNS = new Ship("carrier", "NS");
    const carrierEW = new Ship("carrier", "EW");
    const destroyerNS = new Ship("destroyer", "NS");
    const destroyerEW = new Ship("destroyer", "EW");
    const testCases = [
      board.isValidPlacementLocation(new Point(0, -1), carrierNS),
      board.isValidPlacementLocation(new Point(5, 9), carrierNS),
      board.isValidPlacementLocation(new Point(4, 7), carrierNS),
      board.isValidPlacementLocation(new Point(7, 0), carrierEW),
      board.isValidPlacementLocation(new Point(-1, 9), carrierEW),
      board.isValidPlacementLocation(new Point(6, 9), carrierNS),
      board.isValidPlacementLocation(new Point(-1, -1), destroyerNS),
      board.isValidPlacementLocation(new Point(9, 9), destroyerEW),
      board.isValidPlacementLocation(new Point(5, 10), destroyerEW),
      board.isValidPlacementLocation(new Point(9, 0), destroyerEW),
      board.isValidPlacementLocation(new Point(-1, 5), destroyerNS),
      board.isValidPlacementLocation(new Point(9, 9), destroyerNS),
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
    const carrier = new Ship("carrier", "NS");
    const carrier2 = new Ship("carrier", "EW");
    board.addShip(new Point(0, 0), carrier);
    board.addShip(new Point(1, 0), carrier2);
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
    const carrier = new Ship("carrier", "NS");
    const battleship = new Ship("battleship", "EW");
    const destroyer = new Ship("destroyer", "NS");
    board.addShip(new Point(0, 0), carrier);
    board.addShip(new Point(0, 0), battleship);
    board.addShip(new Point(9, 9), destroyer);
    const testCase = [
      board.isOccupied(new Point(0, 0)),
      board.isOccupied(new Point(1, 0)),
      board.isOccupied(new Point(9, 9)),
    ];
    expect(testCase[0]).toBe(true);
    expect(testCase[1]).toBe(false);
    expect(testCase[2]).toBe(false);
  });
  test("is able to tell us when its is or is not alive", () => {
    const board = new Board(10, 10);
    const carrier = new Ship("carrier", "NS");
    const destroyer = new Ship("destroyer", "EW");
    board.addShip(new Point(0, 0), carrier);
    const testCase = [];
    testCase.push(board.isAlive());
    board.target(new Point(0, 0));
    testCase.push(board.isAlive());
    board.target(new Point(0, 1));
    testCase.push(board.isAlive());
    board.target(new Point(0, 2));
    testCase.push(board.isAlive());
    board.target(new Point(0, 3));
    testCase.push(board.isAlive());
    board.target(new Point(0, 4));
    testCase.push(board.isAlive());
    board.addShip(new Point(1, 1), destroyer);
    testCase.push(board.isAlive());
    board.target(new Point(1, 1));
    testCase.push(board.isAlive());
    board.target(new Point(2, 1));
    testCase.push(board.isAlive());

    expect(testCase[0]).toBe(true);
    expect(testCase[1]).toBe(true);
    expect(testCase[2]).toBe(true);
    expect(testCase[3]).toBe(true);
    expect(testCase[4]).toBe(true);
    expect(testCase[5]).toBe(false);
    expect(testCase[6]).toBe(true);
    expect(testCase[7]).toBe(true);
    expect(testCase[8]).toBe(false);
  });
});
