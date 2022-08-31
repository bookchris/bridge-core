import { Bid } from "./bid";
import { Seat } from "./seat";
import { Suit } from "./suit";

export class Contract {
  suitBid?: Bid;
  /*
  suit?: Suit;
  level?: number;
  index?: number;
  */
  declarer?: Seat;
  doubled?: boolean;
  redoubled?: boolean;
  complete: boolean;
  passed: boolean;

  constructor(readonly bids: Bid[], private dealer: Seat) {
    const firstMap = [new Map<Suit, Seat>(), new Map<Suit, Seat>()];

    bids.forEach((bid, i) => {
      const bidder = this.dealer.next(i);
      if (bid.suit && bid.index && bid.level) {
        /*
        this.suit = bid.suit;
        this.index = bid.index;
        this.level = bid.level;
        */
        this.suitBid = bid;
        this.doubled = false;
        this.redoubled = false;

        if (!firstMap[bidder.teamIndex()].has(bid.suit)) {
          firstMap[bidder.teamIndex()].set(bid.suit, bidder);
        }
        this.declarer = firstMap[bidder.teamIndex()].get(bid.suit);
      }
      if (bid.bid === "X") {
        this.doubled = true;
      } else if (bid.bid === "XX") {
        this.redoubled = true;
        this.doubled = false;
      }
    });
    this.passed = bids.length === 4 && !bids.find((b) => b.bid !== "Pass");
    this.complete =
      this.passed ||
      (bids.length >= 4 && !bids.slice(-3).find((b) => b.bid !== "Pass"));
  }

  toString() {
    if (!this.complete) return "";
    if (this.suitBid === undefined) return "Passed out";

    const result = `${this.suitBid.toString()} ${this.declarer}`;
    if (this.doubled) {
      return result + " Doubled";
    }
    if (this.redoubled) {
      return result + " Redoubled";
    }
    return result;
  }

  get pendingOpponentBid() {
    if (this.bids.length && this.bids[this.bids.length - 1].bid !== "Pass") {
      return this.bids[this.bids.length - 1];
    }
    if (
      this.bids.length >= 3 &&
      this.bids[this.bids.length - 1].bid === "Pass" &&
      this.bids[this.bids.length - 2].bid === "Pass" &&
      this.bids[this.bids.length - 3].bid !== "Pass"
    ) {
      return this.bids[this.bids.length - 3];
    }
    return undefined;
  }

  get canDouble() {
    return !!this.pendingOpponentBid?.suit;
  }

  get canRedouble() {
    return this.pendingOpponentBid?.bid === "X";
  }

  canBid(bid: Bid) {
    if (bid.bid === "Pass") return true;
    if (bid.bid === "X") return this.canDouble;
    if (bid.bid === "XX") return this.canRedouble;
    if (this.suitBid?.index === undefined || bid.index === undefined) {
      return true;
    }
    return this.suitBid?.index < bid.index;
  }
}
