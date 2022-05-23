export class Seat {
  static South = new Seat("South");
  static West = new Seat("West");
  static North = new Seat("North");
  static East = new Seat("East");

  static fromString(input: string) {
    const suit = Seats.find((s) => s.seat === input || s.seat === input[0]);
    if (!suit) {
      throw new Error("Can't make a seat from string: " + input);
    }
    return suit;
  }

  static fromLin(lin: string): Seat {
    const seat = {
      "1": Seat.South,
      "2": Seat.West,
      "3": Seat.North,
      "4": Seat.East,
    }[lin];
    if (!seat) throw new Error(`Invalid lin value for seat: ${lin}`);
    return seat;
  }

  private constructor(private seat: string) {}

  toChar(): string {
    return this.seat.toString()[0];
  }

  toString(): string {
    return this.seat;
  }

  toJson(): string {
    return this.toString();
  }

  index(): number {
    return Seats.indexOf(this);
  }

  next(num: number = 1): Seat {
    return Seats[(this.index() + num) % 4];
  }

  partner(): Seat {
    return this.next(2);
  }
}

export const Seats = [Seat.South, Seat.West, Seat.North, Seat.East];
