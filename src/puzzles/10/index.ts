/* eslint-disable unicorn/no-for-loop, @typescript-eslint/prefer-for-of, id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

type Direction = 'left' | 'right' | 'up' | 'down';

interface Step {
  col: number;
  fromPrev: Direction;
  row: number;
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

const getNextDir = (toDir: Direction, entry: string): Direction => {
  let map: Record<string, Direction>;
  if (toDir === 'down') {
    map = {
      '|': 'down',
      J: 'left',
      L: 'right',
    };
  } else if (toDir === 'left') {
    map = {
      '-': 'left',
      F: 'down',
      L: 'up',
    };
  } else if (toDir === 'right') {
    map = {
      '-': 'right',
      '7': 'down',
      J: 'up',
    };
  } else if (toDir === 'up') {
    map = {
      '|': 'up',
      '7': 'left',
      F: 'right',
    };
  } else {
    throw new Error(`Unable to build dir map for "toDir" of "${toDir}"`);
  }

  return map![entry] as Direction;
};

// Run task one
// eslint-disable-next-line complexity
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  // Get starting position
  const startingPos = { col: 0, row: 0 };
  for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
    for (let colIdx = 0; colIdx < lines[rowIdx]!.length; colIdx++) {
      if (lines[rowIdx]![colIdx] === 'S') {
        startingPos.col = colIdx;
        startingPos.row = rowIdx;
      }
    }
  }

  // Find first step
  const { col: startCol, row: startRow } = startingPos;
  let firstStep: Step;
  if (startRow > 0 && ['F', '7'].includes(lines[startRow - 1]![startCol]!)) {
    firstStep = {
      col: startCol,
      fromPrev: 'up',
      row: startRow - 1,
    };
  } else if (
    startCol > 0 &&
    ['F', 'L'].includes(lines[startRow]![startCol - 1]!)
  ) {
    firstStep = {
      col: startCol - 1,
      fromPrev: 'left',
      row: startRow,
    };
  } else if (
    startRow < lines.length - 1 &&
    ['J', 'L'].includes(lines[startRow + 1]![startCol]!)
  ) {
    firstStep = {
      col: startCol,
      fromPrev: 'down',
      row: startRow + 1,
    };
  } else if (
    startCol < lines[0]!.length - 1 &&
    ['J', '7'].includes(lines[startRow]![startCol + 1]!)
  ) {
    firstStep = {
      col: startCol + 1,
      fromPrev: 'right',
      row: startRow,
    };
  }

  let totalSteps = 0;
  let nextStep = firstStep!;
  while (true) {
    const { col, row, fromPrev } = nextStep;
    if (col === startCol && row === startRow) {
      break;
    }

    totalSteps++;
    const thisEntry = lines[row]![col]!;
    const nextDir = getNextDir(fromPrev, thisEntry);

    nextStep = {
      col: nextDir === 'left' ? col - 1 : nextDir === 'right' ? col + 1 : col,
      fromPrev: nextDir,
      row: nextDir === 'up' ? row - 1 : nextDir === 'down' ? row + 1 : row,
    };
  }

  logAnswer({
    answer: Math.ceil(totalSteps / 2),
    expected: USE_TEST_DATA ? 8 : 6_820,
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
    expected: USE_TEST_DATA ? undefined : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
