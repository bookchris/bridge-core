export class Seat {
  public static South = new Seat("South");
  public static West = new Seat("West");
  public static North = new Seat("North");
  public static East = new Seat("East");

  private constructor(private seat: string) {}

  toChar(): string {
    return this.seat.toString()[0];
  }

  toString(): string {
    return this.seat;
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
