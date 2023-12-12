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

const getStarsAndEmptyRowsCols = (lines: string[]) => {
  const stars: [number, number][] = [];
  const emptyRowsMap = new Map<number, boolean>(
    Array.from({ length: lines.length })
      .fill(undefined)
      .map((_, index) => [index, true]),
  );
  const emptyColsMap = new Map<number, boolean>(
    Array.from({ length: lines[0]!.length })
      .fill(undefined)
      .map((_, index) => [index, true]),
  );

  for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
    const rowEntries = lines[rowIdx]!.split('');
    for (let colIdx = 0; colIdx < lines[0]!.length; colIdx++) {
      const nextEntry = rowEntries[colIdx];
      if (nextEntry === '#') {
        stars.push([colIdx, rowIdx]);
        emptyRowsMap.set(rowIdx, false);
        emptyColsMap.set(colIdx, false);
      }
    }
    lines[rowIdx] = rowEntries.join('');
  }

  const emptyCols = [...emptyColsMap.entries()]
    .filter(([, isEmpty]) => isEmpty)
    .map(([colIdx]) => colIdx);
  const emptyRows = [...emptyRowsMap.entries()]
    .filter(([, isEmpty]) => isEmpty)
    .map(([colIdx]) => colIdx);

  return { emptyCols, emptyRows, stars };
};

const spreadStars = (args: {
  emptyCols: number[];
  emptyRows: number[];
  expandFactor: number;
  stars: [number, number][];
}) => {
  const { emptyCols, emptyRows, stars, expandFactor } = args;
  const expandedStars: [number, number][] = [];
  for (const nextStar of stars) {
    const [starCol, starRow] = nextStar;
    let updatedCol = starCol;
    let updatedRow = starRow;

    for (const nextCol of emptyCols) {
      if (nextCol > starCol) {
        break;
      }
      updatedCol += expandFactor - 1;
    }
    for (const nextRow of emptyRows) {
      if (nextRow > starRow) {
        break;
      }
      updatedRow += expandFactor - 1;
    }

    expandedStars.push([updatedCol, updatedRow]);
  }

  return expandedStars;
};

const getTotalDistanceBetweenPairs = (stars: [number, number][]) => {
  let totalPathsLength = 0;

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const firstStar = stars[i]!;
      const secondStar = stars[j]!;
      const distance =
        Math.abs(firstStar[0] - secondStar[0]) +
        Math.abs(firstStar[1] - secondStar[1]);
      totalPathsLength += distance;
      // console.log(
      //   `Pair of ${i} and ${j} :: ${firstStar} -> ${secondStar} = ${distance} :: total = ${totalPathsLength}`,
      // );
    }
  }

  return totalPathsLength;
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const { emptyCols, emptyRows, stars } = getStarsAndEmptyRowsCols(lines);
  const expandedStars = spreadStars({
    emptyCols,
    emptyRows,
    expandFactor: 2,
    stars,
  });
  const totalDistance = getTotalDistanceBetweenPairs(expandedStars);

  logAnswer({
    answer: totalDistance,
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

  const { emptyCols, emptyRows, stars } = getStarsAndEmptyRowsCols(lines);
  const expandedStars = spreadStars({
    emptyCols,
    emptyRows,
    expandFactor: 1_000_000,
    stars,
  });
  const totalDistance = getTotalDistanceBetweenPairs(expandedStars);

  logAnswer({
    answer: totalDistance,
    expected: USE_TEST_DATA ? 1_030 : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
