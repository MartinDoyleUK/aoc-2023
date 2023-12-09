/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

interface Scratchcard {
  myNumbers: number[];
  toRead: number;
  winners: Set<number>;
}

// Toggle this to use test or real data
const USE_TEST_DATA = false;

// Load data from files
const THIS_FILENAME = url.fileURLToPath(import.meta.url);
const THIS_DIRNAME = path.dirname(THIS_FILENAME);
const PATHS = {
  DATA: path.join(THIS_DIRNAME, 'data.txt'),
  TEST_DATA_01: path.join(THIS_DIRNAME, 'test-data-01.txt'),
  TEST_DATA_02: path.join(THIS_DIRNAME, 'test-data-02.txt'),
};
const DATA = {
  REAL: fs.readFileSync(PATHS.DATA, 'utf8') as string,
  TEST1: fs.readFileSync(PATHS.TEST_DATA_01, 'utf8') as string,
  TEST2: fs.readFileSync(PATHS.TEST_DATA_02, 'utf8') as string,
};

const toNumArray = (input: string) => {
  return input
    .trim()
    .split(' ')
    .map((numStr) => Number.parseInt(numStr, 10));
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replaceAll(/ {2,}/gu, ' ')); // Remove double-spaces

  let totalPoints = 0;
  for (const nextLine of lines) {
    const [, rawNumbers] = nextLine.split(':');
    const [rawWinning, rawMyNums] = rawNumbers!.split('|');
    const winners = new Set(rawWinning!.trim()!.split(' '));
    const myWinners = rawMyNums!
      .trim()
      .split(' ')
      .filter((myNextNum) => winners.has(myNextNum));

    const cardPoints = myWinners.length === 0 ? 0 : 2 ** (myWinners.length - 1);
    totalPoints += cardPoints;
  }

  logAnswer({
    answer: totalPoints,
    expected: USE_TEST_DATA ? 13 : 23_847,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replaceAll(/ {2,}/gu, ' ')); // Remove double-spaces

  const scratchCardsMap = new Map<number, Scratchcard>(
    lines.map((nextLine, index) => {
      const [, rawNumbers] = nextLine.split(':');
      const [rawWinning, rawMyNums] = rawNumbers!.split('|');
      const scratchcard: Scratchcard = {
        myNumbers: toNumArray(rawMyNums!),
        toRead: 1,
        winners: new Set(toNumArray(rawWinning!)),
      };
      return [index + 1, scratchcard];
    }),
  );

  let totalScratchcards = 0;
  for (const [cardNum, card] of scratchCardsMap.entries()) {
    totalScratchcards += card.toRead;

    const myWinners = card.myNumbers.filter((nextNum) =>
      card.winners.has(nextNum),
    );
    const numMatches = myWinners.length;
    for (let i = 0; i < numMatches; i++) {
      scratchCardsMap.get(cardNum + i + 1)!.toRead += card.toRead;
    }
  }

  logAnswer({
    answer: totalScratchcards,
    expected: USE_TEST_DATA ? 30 : 8_570_000,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
