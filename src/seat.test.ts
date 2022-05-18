import { Seat } from "./seat";

describe("seat", () => {
  it.each([
    [Seat.South, Seat.West],
    [Seat.West, Seat.North],
    [Seat.North, Seat.East],
    [Seat.East, Seat.South],
  ])("returns next for %s", (from, expected) => {
    expect(from.next()).toMatchObject(expected);
  });

  it.each([
    [Seat.South, Seat.North],
    [Seat.West, Seat.East],
    [Seat.North, Seat.South],
    [Seat.East, Seat.West],
  ])("returns partner for %s", (from, expected) => {
    expect(from.partner()).toMatchObject(expected);
  });
});
