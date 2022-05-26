import { Hand, HandJson } from "./hand";
import { Seat } from "./seat";
import { Suit, Suits } from "./suit";
import { Vulnerability } from "./vulnerability";

export const linToHand = (data: string): Hand => {
  let url: URL;
  try {
    url = new URL(data);
  } catch (_) {
    throw new Error("Not a valid URL");
  }
  const lin = url.searchParams.get("lin");
  if (!lin) {
    throw new Error("No lin foud in URL");
  }
  const line = lin.split("\n")[0].trim();
  const terms = line.split("|");

  const json: HandJson = {};

  while (terms.length >= 2) {
    const [key, value] = terms;
    terms.splice(0, 2);
    switch (key) {
      case "md":
        json.dealer = Seat.fromLin(value[0]).toJson();
        const linHands = value.substring(1).split(",");
        if (linHands.length !== 4) {
          continue;
        }
        const hands = linHands.map((linHand, i) => {
          const hand: number[] = [];
          ["C", "D", "H", "S"].forEach((s) => {
            const suit = Suit.fromLin(s);
            const start = linHand.indexOf(s) + 1;
            if (start === 0) return;
            let end = linHand.substring(start).search(/[SHDC]/) + start;
            if (end === start - 1) {
              end = linHand.length;
            }
            const cards = linHand.substring(start, end);
            for (const c of cards) {
              const rank = linCardToRank(c);
              if (rank !== -1) {
                hand.push(rank + 13 * Suits.indexOf(suit));
              }
            }
          });
          return hand;
        });
        json.deal = ([] as number[]).concat(
          hands[0],
          hands[1],
          hands[2],
          hands[3]
        );
        break;
      case "sv":
        json.vulnerability = Vulnerability.fromLin(value).toJson();
        break;
      case "mb":
        const bid = linBidToBid(value);
        if (!json.bidding) {
          json.bidding = [];
        }
        json.bidding.push(bid);
        break;
      case "pc":
        const suit = Suit.fromLin(value[0]);
        const rank = linCardToRank(value[1]);
        if (rank === -1) {
          continue;
        }
        const card = rank + 13 * Suits.indexOf(suit);
        if (!json.play) {
          json.play = [];
        }
        json.play.push(card);
        break;
      case "pn":
        const players = value.split(",");
        if (players.length == 4) {
          json.players = players;
        }
        break;
      case "mc":
        const claim = parseInt(value);
        if (!isNaN(claim) && claim >= 0 && claim <= 13) {
          json.claim = claim;
        }
        break;
      case "ah":
        const board = parseInt(value.split(" ").at(-1) || "");
        if (!isNaN(board)) {
          json.board = board;
        }
        break;
      default:
      //console.log("other", key, value);
    }
  }
  return Hand.fromJson(json);
};

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

function linBidToBid(b: string) {
  let bid = b.toUpperCase().replace("!", "");
  if (bid.endsWith("N")) {
    bid = bid + "T";
  } else if (bid === "DBL" || bid === "D") {
    bid = "X";
  } else if (bid === "REDBL" || bid === "R") {
    bid = "XX";
  } else if (bid === "P") {
    bid = "Pass";
  } else {
    bid = bid[0] + Suits[["C", "D", "H", "S"].indexOf(bid[1])];
  }
  return bid;
}
