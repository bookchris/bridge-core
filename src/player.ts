export class Player {
  readonly id;

  constructor(id: string) {
    this.id = id;
  }

  toString() {
    return this.id;
  }

  toJson() {
    return this.toString();
  }

  static compare(a: Player, b: Player): number {
    return a.id.localeCompare(b.id);
  }
}
