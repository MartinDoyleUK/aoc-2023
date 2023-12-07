type HandType = keyof typeof HAND_TYPE_SCORES;

type CardName = keyof typeof CARD_RANKS;

/* eslint-disable canonical/sort-keys */
const HAND_TYPE_SCORES = {
  HIGH_CARD: '1',
  ONE_PAIR: '2',
  TWO_PAIR: '3',
  THREE_OF_A_KIND: '4',
  FULL_HOUSE: '5',
  FOUR_OF_A_KIND: '6',
  FIVE_OF_A_KIND: '7',
};
/* eslint-enable canonical/sort-keys */

/* eslint-disable canonical/sort-keys, id-length */
const CARD_RANKS = {
  '2': '1',
  '3': '2',
  '4': '3',
  '5': '4',
  '6': '5',
  '7': '6',
  '8': '7',
  '9': '8',
  T: '9',
  J: 'A',
  Q: 'B',
  K: 'C',
  A: 'D',
};
/* eslint-enable canonical/sort-keys, id-length */

export class Hand {
  public hand: string;

  public bid: number;

  private type: HandType | undefined;

  private typeScore = 0;

  private handCards = new Map<CardName, number>();

  private useJokers: boolean;

  public constructor(definition: string, useJokers = false) {
    const [hand, rawBid] = definition.split(' ');
    this.hand = hand!;
    this.bid = Number.parseInt(rawBid!, 10);
    this.useJokers = useJokers;

    for (const nextCard of this.hand.split('')) {
      const cardCount = this.handCards.get(nextCard as CardName) ?? 0;
      this.handCards.set(nextCard as CardName, cardCount + 1);
    }

    this.calculateType();
    this.calculateTypeScore();
  }

  private calculateType() {
    const nonJokers = new Map([...this.handCards.entries()].filter(([key]) => !this.useJokers || key !== 'J'));
    const cardCounts = [...nonJokers.values()].sort();
    const numJokers = this.useJokers ? this.handCards.get('J') ?? 0 : 0;

    let type: keyof typeof HAND_TYPE_SCORES;
    if (cardCounts.at(-1)! + numJokers === 5) {
      type = 'FIVE_OF_A_KIND';
    } else if (cardCounts.at(-1)! + numJokers === 4) {
      type = 'FOUR_OF_A_KIND';
    } else if (cardCounts.at(-1)! + numJokers === 3 && cardCounts.at(-2) === 2) {
      type = 'FULL_HOUSE';
    } else if (cardCounts.at(-1)! + numJokers === 3) {
      type = 'THREE_OF_A_KIND';
    } else if (cardCounts.at(-1)! + numJokers === 2 && cardCounts.at(-2) === 2) {
      type = 'TWO_PAIR';
    } else if (cardCounts.at(-1)! + numJokers === 2) {
      type = 'ONE_PAIR';
    } else {
      type = 'HIGH_CARD';
    }

    this.type = type;
  }

  private calculateTypeScore() {
    const handScore = HAND_TYPE_SCORES[this.type!];
    const cardScores = this.hand.replaceAll(/./gu, (nextChar) => {
      if (this.useJokers && nextChar === 'J') {
        return '0';
      }
      return `${CARD_RANKS[nextChar as CardName]}`;
    });
    const rawScore = `${handScore}${cardScores}`;
    const typeScore = Number.parseInt(rawScore, 16);

    // eslint-disable-next-line canonical/sort-keys
    // console.log({ hand: this.hand, handScore, cardScores, rawScore, typeScore });

    this.typeScore = typeScore;
  }

  public compareTo(other: Hand): number {
    return this.typeScore - other.typeScore;
  }

  public toJSON() {
    return `${this.hand} (${this.type}) => ${this.bid}`;
  }
}
