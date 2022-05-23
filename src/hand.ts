import { Bid } from "./bid";
import { Bidding } from "./bidding";
import { Card } from "./card";
import { linToHand } from "./lin";
import { Player } from "./player";
import { Seat } from "./seat";
import { Trick } from "./trick";

export type HandJson = {
  board?: number;
  dealer?: string;
  deal?: number[];
  bidding?: string[];
  play?: number[];
  players?: string[];
  claim?: number;
};

export class Hand {
  readonly bidding: Bidding;

  constructor(
    readonly id: string | undefined,
    readonly board: number,
    readonly dealer: Seat,
    readonly deal: Card[],
    readonly bids: Bid[],
    readonly play: Card[],
    readonly claim: number,
    readonly players: Player[]
  ) {
    this.bidding = new Bidding(bids, this.dealer);
  }

  static fromJson(data: HandJson, id?: string): Hand {
    const dataPlayers = data.players?.map((p) => new Player(p)) || [];
    const players = [
      new Player("South"),
      new Player("West"),
      new Player("North"),
      new Player("East"),
    ];
    players.splice(0, dataPlayers.length, ...dataPlayers);

    return new Hand(
      id,
      data.board || -1,
      Seat.fromString(data.dealer || ""),
      data.deal?.map((c) => new Card(c)) || [],
      data.bidding?.map((b) => new Bid(b)) || [],
      data.play?.map((c) => new Card(c)) || [],
      data.claim || -1,
      players
    );
  }

  static fromLin(url: string): Hand {
    return linToHand(url);
  }

  toJson(): HandJson {
    return {
      board: this.board,
      dealer: this.dealer.toJson(),
      deal: this.deal.map((c) => c.toJson()),
      bidding: this.bids.map((b) => b.toJson()),
      play: this.play.map((c) => c.toJson()),
      players: this.players.map((p) => p.toJson()),
      claim: this.claim,
    };
  }

  getHolding(seat: Seat): Card[] {
    if (this.deal.length != 52) {
      return [];
    }
    const offset = 13 * seat.index();
    return this.deal
      .slice(offset, offset + 13)
      .filter((c) => !this.play.find((p) => p.id === c.id))
      .sort(Card.comparator)
      .reverse();
  }

  get north() {
    return this.getHolding(Seat.North);
  }

  get south() {
    return this.getHolding(Seat.South);
  }

  get east() {
    return this.getHolding(Seat.East);
  }

  get west() {
    return this.getHolding(Seat.West);
  }

  get nextBidder() {
    return this.dealer.next(this.bidding.bids.length);
  }

  get state() {
    if (this.bidding.passed) {
      return HandState.Complete;
    }
    if (!this.bidding.complete) {
      return HandState.Bidding;
    }
    if (this.claim !== -1) return HandState.Complete;
    if (this.play?.length === 52) return HandState.Complete;
    return HandState.Playing;
  }

  get isPlaying() {
    return this.state === HandState.Playing;
  }

  get isBidding() {
    return this.state === HandState.Bidding;
  }

  get openingLeader() {
    return this.bidding.declarer ? this.bidding.declarer.next() : undefined;
  }

  get result() {
    if (
      this.bidding.passed ||
      this.state !== HandState.Complete ||
      !this.bidding.level
    ) {
      return 0;
    }
    let tricks = 0;
    if (this.claim !== -1) {
      tricks = this.claim;
    } else {
      if (
        this.bidding.declarer == Seat.North ||
        this.bidding.declarer == Seat.South
      ) {
        tricks = this.tricks.filter(
          (t) => t.winningSeat === Seat.North || t.winningSeat === Seat.South
        ).length;
      } else {
        tricks = this.tricks.filter(
          (t) => t.winningSeat === Seat.East || t.winningSeat === Seat.West
        ).length;
      }
    }
    return tricks - (6 + this.bidding.level);
  }

  get score() {
    if (this.bidding.passed || this.state !== HandState.Complete) {
      return 0;
    }
    return "TODO";
  }

  get player() {
    const tricks = this.tricks;
    if (!tricks.length) {
      return this.openingLeader;
    }
    return tricks[tricks.length - 1].player;
  }

  get turn() {
    if (this.isBidding) {
      return this.nextBidder;
    }
    if (this.isPlaying) {
      return this.player;
    }
  }

  get tricks() {
    const trump = this.bidding.suit;
    if (!trump) {
      return [];
    }
    if (!this.openingLeader) {
      return [];
    }
    let leader = this.openingLeader;
    const tricks = [] as Trick[];
    for (let i = 0; i < this.play.length; i += 4) {
      const cards = this.play.slice(i, i + 4);
      const trick = new Trick(leader, cards, trump);
      if (trick.winningSeat) {
        leader = trick.winningSeat;
      }
      tricks.push(trick);
    }
    return tricks;
  }

  setPlayer(seat: Seat, player: string) {
    const players = this.players;
    players[seat.index()] = new Player(player);
    return new Hand(
      this.id,
      this.board,
      this.dealer,
      this.deal,
      this.bids,
      this.play,
      this.claim,
      players
    );
  }

  get positions() {
    return this.bidding.bids.length + this.play.length;
  }

  atPosition(pos: number) {
    console.log("position", pos);
    if (pos < 0) {
      return this;
    }
    if (pos >= this.play.length + this.bids.length) {
      return this;
    }

    const bids = this.bids.slice(0, pos);
    const play =
      bids.length <= pos ? [] : this.play.slice(0, pos - bids.length);
    /*
    const play = this.play.slice(0, Math.max(this.play.length - pos, 0));
    pos -= this.play.length - play.length;

    const bidding = this.bidding.bids.slice(
      0,
      Math.max(this.bidding.bids.length - pos, 0)
    );
    */

    return new Hand(
      this.id,
      this.board,
      this.dealer,
      this.deal,
      bids,
      play,
      this.claim,
      this.players
    );
  }

  lastAction(): Bid | Card {
    if (this.play.length) {
      return this.play[this.play.length - 1];
    }
    if (this.bids.length) {
      return this.bids[this.bids.length - 1];
    }
    throw new Error("No past actions");
  }

  isEquivalent(hand: Hand) {
    if (this.deal.length != hand.deal.length) {
      return false;
    }
    if (this.bids.length != hand.bids.length) {
      return false;
    }
    if (this.play.length != hand.play.length) {
      return false;
    }
    for (let i in this.deal) {
      if (this.deal[i].id !== hand.deal[i].id) {
        return false;
      }
    }
    for (let i in this.bids) {
      if (this.bids[i].bid !== hand.bids[i].bid) {
        return false;
      }
    }
    for (let i in this.play) {
      if (this.play[i].id !== hand.play[i].id) {
        return false;
      }
    }
    return true;
  }

  canBid(bid: Bid, seat: Seat) {
    if (!this.isBidding) return false;
    if (this.nextBidder != seat) return false;
    if (!this.bidding.validateNext(bid)) return false;
    return true;
  }

  doBid(bid: Bid, seat: Seat) {
    if (!this.canBid(bid, seat)) {
      return undefined;
    }
    return new Hand(
      this.id,
      this.board,
      this.dealer,
      this.deal,
      [...this.bids, bid],
      this.play,
      this.claim,
      this.players
    );
  }
}

export enum HandState {
  Bidding,
  Playing,
  Complete,
}
