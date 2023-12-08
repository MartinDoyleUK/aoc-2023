type HandType = keyof typeof HAND_TYPE_SCORES;

type CardName = keyof typeof CARD_RANKS_AS_HEX;

/* eslint-disable canonical/sort-keys */
const HAND_TYPE_SCORES = {
  HIGH_CARD: '1',
  ONE_PAIR: '2',
  TWO_PAIRS: '3',
  THREE_OF_A_KIND: '4',
  FULL_HOUSE: '5',
  FOUR_OF_A_KIND: '6',
  FIVE_OF_A_KIND: '7',
};
/* eslint-enable canonical/sort-keys */

/* eslint-disable canonical/sort-keys, id-length */
const CARD_RANKS_AS_HEX = {
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

  private handCardCounts = new Map<CardName, number>(
    Object.keys(CARD_RANKS_AS_HEX).map((nextKey) => [nextKey as CardName, 0]),
  );

  private useJokers: boolean;

  public constructor(definition: string, useJokers: boolean) {
    const [hand, rawBid] = definition.split(' ');
    this.hand = hand!;
    this.bid = Number.parseInt(rawBid!, 10);
    this.useJokers = useJokers;

    for (const nextCard of this.hand.split('')) {
      const cardCount = this.handCardCounts.get(nextCard as CardName)!;
      this.handCardCounts.set(nextCard as CardName, cardCount + 1);
    }

    this.calculateType();
    this.calculateTypeScore();
  }

  private calculateType() {
    const numJokers = this.useJokers ? this.handCardCounts.get('J')! : 0;
    const cardsWithoutJokers = [...this.handCardCounts.entries()].filter(
      ([key]) => {
        return !this.useJokers || key !== 'J';
      },
    );

    const cardsToUse = new Map(cardsWithoutJokers);
    const cardCounts = [...cardsToUse.values()].sort();
    cardCounts.push(cardCounts.pop()! + numJokers);
    const countsString = cardCounts.join('');

    let type: keyof typeof HAND_TYPE_SCORES;
    if (countsString.endsWith('5')) {
      type = 'FIVE_OF_A_KIND';
    } else if (countsString.endsWith('4')) {
      type = 'FOUR_OF_A_KIND';
    } else if (countsString.endsWith('23')) {
      type = 'FULL_HOUSE';
    } else if (countsString.endsWith('3')) {
      type = 'THREE_OF_A_KIND';
    } else if (countsString.endsWith('22')) {
      type = 'TWO_PAIRS';
    } else if (countsString.endsWith('2')) {
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
      return `${CARD_RANKS_AS_HEX[nextChar as CardName]}`;
    });
    const rawScore = `${handScore}${cardScores}`;
    const typeScore = Number.parseInt(rawScore, 16);

    this.typeScore = typeScore;
  }

  public compareTo(other: Hand): number {
    return this.typeScore - other.typeScore;
  }
}
