import Ship from "../Ship";

const battleship = new Ship("battleship");
const carrier = new Ship("carrier");
const cruiser = new Ship("cruiser");
const submarine = new Ship("submarine");
const destroyer = new Ship("destroyer");

describe("the ships created by new Ship()", () => {
  test("have the right number of parts", () => {
    expect(carrier.parts.length).toEqual(5);
    expect(battleship.parts.length).toEqual(4);
    expect(cruiser.parts.length).toEqual(3);
    expect(submarine.parts.length).toEqual(3);
    expect(destroyer.parts.length).toEqual(2);
  });
  test("increment damage when thier parts are damaged", () => {
    carrier.parts[0].damaged = true;
    carrier.parts[1].damaged = true;
    expect(carrier.damagedParts).toEqual(2);
  });
  test("do not increment damage if a part that is already damaged is damaged again", () => {
    carrier.parts[0].damaged = true;
    carrier.parts[1].damaged = true;
    expect(carrier.damagedParts).toEqual(2);
  });
  test("are afloat prior to receiving full damage", () => {
    expect(carrier.isAfloat()).toEqual(true);
  });
  test("are sunk if all parts are admaged", () => {
    carrier.parts[2].damaged = true;
    carrier.parts[3].damaged = true;
    carrier.parts[4].damaged = true;
    expect(carrier.isAfloat()).toEqual(false);
  });
});
