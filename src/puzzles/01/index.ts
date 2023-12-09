/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

type CheckForDigitFn = (opts: {
  includeWords: boolean;
  input: string;
  pos: number;
}) => string | undefined;

type GetNumberForLineFn = (opts: {
  includeWords: boolean;
  line: string;
}) => number;

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

/* eslint-disable canonical/sort-keys */
const STRING_VALUES = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};
/* eslint-enable canonical/sort-keys */
const REGEX_NUMBER = new RegExp(
  `^(${Object.keys(STRING_VALUES).join('|')}|\\d)`,
  'u',
);
// eslint-disable-next-line unicorn/no-array-reduce
const LONGEST_NUMBER_STRING = Object.keys(STRING_VALUES).reduce(
  (prev, next) => (next.length > prev ? next.length : prev),
  0,
);

const checkForDigit: CheckForDigitFn = ({ input, pos, includeWords }) => {
  const nextWindow = input.slice(pos, pos + LONGEST_NUMBER_STRING);
  let digit: string | undefined;

  const match = nextWindow.match(REGEX_NUMBER);
  if (match) {
    const number = match[1]!;
    if (number.length === 1) {
      digit = number;
    } else if (includeWords) {
      digit = STRING_VALUES[number as keyof typeof STRING_VALUES];
    }
  }

  return digit;
};

const getNumberForLine: GetNumberForLineFn = ({ includeWords, line }) => {
  let firstDigit: string | undefined;
  let lastDigit: string | undefined;

  let pos = 0;
  while (firstDigit === undefined && pos < line.length) {
    firstDigit = checkForDigit({ includeWords, input: line, pos: pos++ });
  }

  pos = line.length - 1;
  while (lastDigit === undefined && pos >= 0) {
    lastDigit = checkForDigit({ includeWords, input: line, pos: pos-- });
  }

  if (firstDigit === undefined || lastDigit === undefined) {
    throw new Error(`Could not find first and last digits for line ${line}`);
  }

  return Number.parseInt(firstDigit + lastDigit, 10);
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  let total = 0;
  for (const nextLine of lines) {
    const lineValue = getNumberForLine({ includeWords: false, line: nextLine });
    total += lineValue;
  }

  logAnswer({
    answer: total,
    expected: USE_TEST_DATA ? 142 : 55_477,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  let total = 0;
  for (const nextLine of lines) {
    const lineValue = getNumberForLine({ includeWords: true, line: nextLine });
    total += lineValue;
  }

  logAnswer({
    answer: total,
    expected: USE_TEST_DATA ? 281 : 54_431,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
