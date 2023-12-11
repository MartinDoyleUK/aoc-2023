/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

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

const getEmptyRowsAndCols = (lines: string[]) => {
  const numRows = lines.length;
  const numCols = lines[0]!.length;

  const emptyRowsMap = new Map<number, boolean>();
  const emptyColsMap = new Map<number, boolean>();
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    emptyRowsMap.set(rowIdx, true);
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      if (!emptyColsMap.has(colIdx)) {
        emptyColsMap.set(colIdx, true);
      }
      if (lines[rowIdx]![colIdx] === '#') {
        emptyRowsMap.set(rowIdx, false);
        emptyColsMap.set(colIdx, false);
      }
    }
  }
  const emptyRows = [...emptyRowsMap.entries()]
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  const emptyCols = [...emptyColsMap.entries()]
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  return { emptyCols, emptyRows };
};

const mutateAndInsertEmptyRowsCols = (lines: string[]) => {
  const { emptyCols, emptyRows } = getEmptyRowsAndCols(lines);
  for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
    const cols = lines[rowIdx]!.split('') as (string | string[])[];
    for (const nextCol of emptyCols) {
      cols[nextCol] = ['.', '.'];
    }
    lines[rowIdx] = cols.flat().join('');
  }
  for (const nextEmptyRow of emptyRows.reverse()) {
    lines.splice(nextEmptyRow, 0, lines[nextEmptyRow]!.slice());
  }
};

const numPairToString = (num1: number, num2: number): string => {
  return `${num1}_${num2}`;
};

const stringToNumPair = (input: string): [number, number] => {
  const numberStrings = input.split('_');
  if (numberStrings.length !== 2) {
    throw new Error(`Cannot convert to num-pair - invalid format: "${input}"`);
  }
  return numberStrings.map((n) => Number.parseInt(n, 10)) as [number, number];
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  // Insert empty rows/cols and get updated row/col counts
  mutateAndInsertEmptyRowsCols(lines);
  const numRows = lines.length;
  const numCols = lines[0]!.length;

  // Find stars
  const starsMap = new Map<number, string>();
  const reverseStarsMap = new Map<string, number>();
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    const rowEntries = lines[rowIdx]!.split('');
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const nextEntry = rowEntries[colIdx];
      if (nextEntry === '#') {
        const squareId = numPairToString(colIdx, rowIdx);
        const starNumber = starsMap.size + 1;
        starsMap.set(starNumber, squareId);
        reverseStarsMap.set(squareId, starNumber);
      }
    }
    lines[rowIdx] = rowEntries.join('');
  }
  // console.log('starsMap', starsMap);
  // console.log('reverseStarsMap', reverseStarsMap);
  // console.log(lines.join('\n'));

  const shortestPaths = new Map<string, number>();
  for (const [startStar, startPos] of starsMap.entries()) {
    const [startCol, startRow] = stringToNumPair(startPos);
    for (const [targetStar, targetPos] of starsMap.entries()) {
      if (targetStar === startStar) {
        continue;
      }
      const starsPair = `${Math.min(targetStar, startStar)}_${Math.max(
        targetStar,
        startStar,
      )}`;
      if (shortestPaths.has(starsPair)) {
        continue;
      }

      const [targetCol, targetRow] = stringToNumPair(targetPos);
      const distance =
        Math.abs(targetCol - startCol) + Math.abs(targetRow - startRow);
      shortestPaths.set(starsPair, distance);
    }
  }

  console.log(`Number of stars: ${starsMap.size}`);
  // console.log(shortestPaths);
  const totalOfShortestPaths = [...shortestPaths.values()].reduce(
    (prev, next) => prev + next,
    0,
  );

  logAnswer({
    answer: totalOfShortestPaths,
    expected: USE_TEST_DATA ? 374 : 9_550_717,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  logAnswer({
    answer: lines.length,
    expected: USE_TEST_DATA ? 8_410 : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
