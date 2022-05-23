import { Suit } from "./suit";

export class Card {
  readonly id: number;
  readonly suit: Suit;
  readonly rank: number;

  constructor(id: number) {
    this.id = id;
    this.suit = Object.values(Suit)[Math.floor(id / 13)];
    this.rank = id % 13;
  }

  get rankStr() {
    switch (this.rank) {
      case 8:
        return "T";
      case 9:
        return "J";
      case 10:
        return "Q";
      case 11:
        return "K";
      case 12:
        return "A";
      default:
        return `${this.rank + 2}`;
    }
  }

  toString() {
    return `${this.rankStr}${this.suit}`;
  }

  toJson(): number {
    return this.id;
  }

  static comparator(a: Card, b: Card): number {
    return a.id - b.id;
  }
}
