import { Bid, SuitBids } from "./bid";
import { Seat } from "./seat";
import { Suit } from "./suit";

export class Bidding {
  suit?: Suit;
  level?: number;
  index?: number;
  bidder?: Seat;
  doubled?: boolean;
  redoubled?: boolean;
  complete: boolean;
  passed: boolean;

  constructor(readonly bids: Bid[], private dealer: Seat) {
    bids.forEach((bid, i) => {
      if (bid.suit && bid.index && bid.level) {
        this.suit = bid.suit;
        this.index = bid.index;
        this.level = bid.level;
        this.doubled = false;
        this.redoubled = false;
        this.bidder = this.dealer.next(i);
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

  get contract() {
    if (!this.complete) return "";
    if (this.index === undefined) return "Passed out";

    const result = `${SuitBids[this.index]} ${this.declarer}`;
    if (this.doubled) {
      return result + " Doubled";
    }
    if (this.redoubled) {
      return result + " Redoubled";
    }
    return result;
  }

  get declarer() {
    if (this.suit && this.bidder) {
      const partner = this.bidder.partner();
      let seat = this.dealer;
      for (let i = 0; i < this.bids.length; i++) {
        const bid = this.bids[i];
        if (bid.suit === this.suit) {
          if (seat === this.bidder) {
            return this.bidder;
          }
          if (seat === partner) {
            return partner;
          }
        }
        seat = seat.next();
      }
    }
    return undefined;
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

  get validBids(): Bid[] {
    let bids = [Bid.Pass];
    if (this.canDouble) {
      bids.push(Bid.Double);
    }
    if (this.canRedouble) {
      bids.push(Bid.Redouble);
    }
    if (this.index) {
      return bids.concat(SuitBids.slice(this.index + 1).map((b) => new Bid(b)));
    }
    return bids.concat(SuitBids.map((b) => new Bid(b)));
  }

  get validBidLevel() {
    if (this.index) {
      const next = this.index + 1;
      if (next >= SuitBids.length) {
        return 8;
      }
      return parseInt(SuitBids[next][0]);
    }
    return 1;
  }

  validateNext(bid: Bid) {
    if (bid.bid === "Pass") return true;
    if (bid.bid === "X") return this.canDouble;
    if (bid.bid === "XX") return this.canRedouble;
    if (!this.index || !this.suit || !bid.index || !bid.suit) return true;
    return (
      this.index < bid.index ||
      (this.index === bid.index && this.suit < bid.suit)
    );
  }
}
