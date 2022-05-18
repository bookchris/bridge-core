export class Suit {
  public static Club = new Suit("♣", "C");
  public static Diamond = new Suit("♦", "D");
  public static Heart = new Suit("♥", "H");
  public static Spade = new Suit("♠", "S");
  public static NoTrump = new Suit("NT");

  private constructor(private suit: String, private alt?: String) {}

  toString() {
    return this.suit;
  }

  public static fromString(input: string) {
    const suit = Suits.find((s) => s.suit === input || s.alt === input);
    if (!suit) {
      throw new Error("Can't make a suit from string: " + input);
    }
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
