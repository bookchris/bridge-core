export class Suit {
  public static Club = new Suit("♣", "C");
  public static Diamond = new Suit("♦", "D");
  public static Heart = new Suit("♥", "H");
  public static Spade = new Suit("♠", "S");
  public static NoTrump = new Suit("NT", "N");

  private constructor(private suit: string, private alt?: string) {}

  toString() {
    return this.suit;
  }

  toLin() {
    return this.alt || this.suit;
  }

  index() {
    Suits.indexOf(this);
  }

  public static fromString(input: string) {
    const suit = Suits.find((s) => s.suit === input || s.alt === input);
    if (!suit) {
      throw new Error("Can't make a suit from string: " + input);
    }
    return suit;
  }

  public static fromLin(lin: string): Suit {
    const suit = {
      S: Suit.Spade,
      H: Suit.Heart,
      D: Suit.Diamond,
      C: Suit.Club,
      NT: Suit.NoTrump,
    }[lin];
    if (!suit) throw new Error(`Invalid lin value for suit: ${lin}`);
    return suit;
  }
}

export const Suits = [
  Suit.Club,
  Suit.Diamond,
  Suit.Heart,
  Suit.Spade,
  Suit.NoTrump,
];
