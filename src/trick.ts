import { Card } from "./card";
import { Seat } from "./seat";
import { Suit } from "./suit";

export class Trick {
  constructor(
    readonly leader: Seat,
    readonly cards: Card[],
    readonly trump: Suit
  ) {}

  get complete() {
    return this.cards.length === 4;
  }

  get player() {
    if (this.complete) {
      return this.winningSeat;
    } else {
      return this.leader.next(this.cards.length);
    }
  }

  get winningSeat() {
    if (this.cards.length != 4) {
      return undefined;
    }
    let winner = this.cards[0];
    let seat = this.leader;
    this.cards.slice(1).forEach((card, i) => {
      const ws = winner.suit;
      const cs = card.suit;
      if (ws == cs) {
        if (winner.id < card.id) {
          winner = card;
          seat = this.leader.next(i + 1);
        }
      } else if (cs == this.trump) {
        winner = card;
        seat = this.leader.next(i + 1);
      }
    });
    return seat;
  }
}
