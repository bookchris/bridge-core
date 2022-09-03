import { Suit, Suits } from "./suit";

export class Card {
  readonly id: number;
  readonly suit: Suit;
  readonly rank: number;

  constructor(id: number) {
    this.id = id;
    this.suit = Object.values(Suit)[Math.floor(id / 13)];
    this.rank = id % 13;
  }

  static fromLin(value: string): Card {
    const suit = Suit.fromLin(value[0]);
    const rank = linCardToRank(value[1]);
    if (rank === -1) {
      throw new Error("Unable to parse card: " + value);
    }
    return new Card(rank + 13 * Suits.indexOf(suit));
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

function linCardToRank(c: string) {
  switch (c) {
    case "A":
      return 12;
    case "K":
      return 11;
    case "Q":
      return 10;
    case "J":
      return 9;
    case "T":
      return 8;
  }
  const number = parseInt(c);
  if (number > 0) {
    return number - 2;
  }
  return -1;
}
