/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

import { Hand } from './hand';

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

// Run task one
const runOne = () => {
  const taskStarted = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const hands = lines.map((nextLine) => new Hand(nextLine));
  const sortedHands = hands.sort((a, b) => a.compareTo(b));

  let totalWinnings = 0;
  for (const [handIndex, nextHand] of sortedHands.entries()) {
    totalWinnings += nextHand.bid * (handIndex + 1);
  }

  logAnswer(1, taskStarted, totalWinnings, USE_TEST_DATA ? 6_440 : 253_638_586);
};

// Run task two
const runTwo = () => {
  const taskStarted = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const hands = lines.map((nextLine) => new Hand(nextLine, true));
  const sortedHands = hands.sort((a, b) => a.compareTo(b));

  console.log(sortedHands.map((nextHand) => JSON.stringify(nextHand)).join('\n'));

  let totalWinnings = 0;
  for (const [handIndex, nextHand] of sortedHands.entries()) {
    totalWinnings += nextHand.bid * (handIndex + 1);
  }

  logAnswer(2, taskStarted, totalWinnings, USE_TEST_DATA ? 5_905 : undefined);
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
