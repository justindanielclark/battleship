import { Board } from "../board";

const board = new Board(10, 10);

describe("the board created by new Board", () => {
  test("test1", () => {
    expect(1).toBe(1);
  });
  test("test2", () => {
    expect(2).toBe(2);
  });
});
