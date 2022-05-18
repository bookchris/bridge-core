import { Suit, Suits } from "./suit";

export const SuitBids = ["1", "2", "3", "4", "5", "6", "7"].reduce(
  (res, bid: string) => {
    const level = Suits.map((s) => bid + s);
    return res.concat(level);
  },
  [] as string[]
);

export class Bid {
  readonly bid: string;
  readonly suit?: Suit;
  readonly level?: number;
  readonly index?: number;

  constructor(bid: string) {
    this.bid = bid;
    if (bid != "Pass" && bid != "X" && bid != "XX") {
      this.suit = Suit.fromString(bid.substring(1));
      this.index = SuitBids.indexOf(bid);
      this.level = parseInt(bid[0]);
    }
  }
}
