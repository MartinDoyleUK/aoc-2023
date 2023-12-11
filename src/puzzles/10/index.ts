/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/prefer-for-of, id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

type Direction = 'left' | 'right' | 'up' | 'down';

interface Square {
  col: number;
  entry?: string;
  row: number;
}

interface Step extends Square {
  fromPrev: Direction;
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

const getSquareId = ({ col, row }: Square): string => {
  return `${col},${row}`;
};

const getStartingSquare = (lines: string[]): Square => {
  let startingCol = 0;
  let startingRow = 0;

  for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
    for (let colIdx = 0; colIdx < lines[rowIdx]!.length; colIdx++) {
      const entry = lines[rowIdx]![colIdx];
      if (entry === 'S') {
        startingCol = colIdx;
        startingRow = rowIdx;
      }
    }
  }

  return { col: startingCol, row: startingRow };
};

const calculateStartingEntry = ({
  lines,
  startingSquare,
}: {
  lines: string[];
  startingSquare: Square;
}): string => {
  const { col: startCol, row: startRow } = startingSquare;
  const startingDirs: Direction[] = [];
  if (
    startRow > 0 &&
    ['F', '7', '|'].includes(lines[startRow - 1]![startCol]!)
  ) {
    startingDirs.push('up');
  }
  if (
    startCol > 0 &&
    ['F', 'L', '-'].includes(lines[startRow]![startCol - 1]!)
  ) {
    startingDirs.push('left');
  }
  if (
    startRow < lines.length - 1 &&
    ['J', 'L', '|'].includes(lines[startRow + 1]![startCol]!)
  ) {
    startingDirs.push('down');
  }
  if (
    startCol < lines[0]!.length - 1 &&
    ['J', '7', '-'].includes(lines[startRow]![startCol + 1]!)
  ) {
    startingDirs.push('right');
  }

  const [firstDir, secondDir] = startingDirs.sort() as [Direction, Direction];
  const startingEntryLookup: Record<string, string> = {
    down_left: '7',
    down_right: 'F',
    down_up: '|',
    left_right: '-',
    left_up: 'J',
    right_up: 'L',
  };

  return startingEntryLookup[`${firstDir}_${secondDir}`]!;
};

const getPipeSquares = ({
  lines,
  startingSquare: { col: startCol, row: startRow, entry: startEntry },
}: {
  lines: string[];
  startingSquare: Square;
}): Set<string> => {
  const pipeSquareId = new Set<string>();

  const firstStep: Step = { col: 0, fromPrev: 'up', row: 0 };
  if (['J', '7'].includes(startEntry!)) {
    firstStep.col = startCol + 1;
    firstStep.row = startRow;
    firstStep.fromPrev = 'right';
  } else if (startEntry === '|') {
    firstStep.col = startCol;
    firstStep.row = startRow + 1;
    firstStep.fromPrev = 'down';
  } else {
    firstStep.col = startCol - 1;
    firstStep.row = startRow;
    firstStep.fromPrev = 'left';
  }

  let nextStep = firstStep!;
  while (true) {
    pipeSquareId.add(getSquareId(nextStep));
    const { col, row, fromPrev } = nextStep;
    if (col === startCol && row === startRow) {
      break;
    }

    const thisEntry = lines[row]![col]!;
    const nextDir = getNextDir(fromPrev, thisEntry);
    nextStep = {
      col: nextDir === 'left' ? col - 1 : nextDir === 'right' ? col + 1 : col,
      fromPrev: nextDir,
      row: nextDir === 'up' ? row - 1 : nextDir === 'down' ? row + 1 : row,
    };
  }

  return pipeSquareId;
};

const getIntersections = ({
  square: { col, row },
  lines,
  pipeSquareIds,
}: {
  lines: string[];
  pipeSquareIds: Set<string>;
  square: Square;
}): number => {
  let intersections = 0;
  let ups = 0;
  let downs = 0;
  let nextCol = col - 1;

  while (nextCol >= 0) {
    const nextSquare: Square = {
      col: nextCol,
      entry: lines[row]![nextCol]!,
      row,
    };
    const nextSquareId = getSquareId(nextSquare);
    if (pipeSquareIds.has(nextSquareId)) {
      switch (nextSquare.entry) {
        case '|':
          intersections++;
          break;
        case 'L':
        case 'J':
          ups++;
          break;
        case '7':
        case 'F':
          downs++;
          break;
        default:
        // Do nothing
      }
    }
    nextCol--;
  }

  const numSame = Math.min(downs, ups);
  intersections += numSame;

  return intersections;
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  // Get starting position and its entry
  const startingSquare = getStartingSquare(lines);
  startingSquare.entry = calculateStartingEntry({ lines, startingSquare });

  // Replace starting char
  const startingLine = lines[startingSquare.row]!;
  const startingLineChars = startingLine.split('');
  startingLineChars.splice(startingSquare.col, 1, startingSquare.entry);
  const updatedLine = startingLineChars.join('');
  lines[startingSquare.row] = updatedLine;

  // Get all pipes
  const pipeSquareIds = getPipeSquares({ lines, startingSquare });

  logAnswer({
    answer: Math.ceil(pipeSquareIds.size / 2),
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

  // Get starting position and its entry
  const startingSquare = getStartingSquare(lines);
  startingSquare.entry = calculateStartingEntry({ lines, startingSquare });

  // Replace starting char
  const startingLine = lines[startingSquare.row]!;
  const startingLineChars = startingLine.split('');
  startingLineChars.splice(startingSquare.col, 1, startingSquare.entry);
  const updatedLine = startingLineChars.join('');
  lines[startingSquare.row] = updatedLine;

  // Get all pipes
  const pipeSquareIds = getPipeSquares({ lines, startingSquare });

  // Calculate left-intersections with polygon (ray-casting algorithm)
  const insideSquares: Square[] = [];
  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[0]!.length; col++) {
      const nextSquare: Square = { col, entry: lines[row]![col], row };
      if (pipeSquareIds.has(getSquareId(nextSquare))) {
        continue;
      }
      const numIntersections = getIntersections({
        lines,
        pipeSquareIds,
        square: nextSquare,
      });
      if (numIntersections % 2 === 1) {
        insideSquares.push(nextSquare);
      }
    }
  }

  logAnswer({
    answer: insideSquares.length,
    expected: USE_TEST_DATA ? 10 : 337,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
