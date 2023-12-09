/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

interface NumberEntry {
  number: number;
  used: boolean;
}

type ToPosFn = (args: { col: number; row: number }) => string;

type FromPosFn = (posString: string) => { col: number; row: number };

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

// Test constants
const REGEX_DIGIT = /^\d$/u;

const toPos: ToPosFn = ({ row, col }) => {
  return `${col}x${row}`;
};

const fromPos: FromPosFn = (posString) => {
  const [col, row] = posString.split('x');
  return { col: Number.parseInt(col!, 10), row: Number.parseInt(row!, 10) };
};

const parseData = (data: string) => {
  const lines = data.split('\n').filter((line) => line.trim().length > 0);

  const symbols = new Map<string, string>();
  const numbers = new Map<string, NumberEntry>();
  let numberBuffer: string | undefined;
  let numberCol: number | undefined;

  const storeNumber = (rowIdx: number) => {
    if (numberBuffer === undefined || numberCol === undefined) {
      throw new Error(
        `Unable to store number (numberString=${numberBuffer}, numberCol=${numberCol})`,
      );
    }

    const numberEntry = {
      number: Number.parseInt(numberBuffer, 10),
      used: false,
    };
    for (
      let colIdx = numberCol;
      colIdx < numberCol + numberBuffer!.length;
      colIdx++
    ) {
      numbers.set(
        toPos({
          col: colIdx,
          row: rowIdx,
        }),
        numberEntry,
      );
    }
    numberBuffer = undefined;
    numberCol = undefined;
  };

  const rowCount = lines.length;
  const colCount = lines[0]!.length;

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    const nextLine = lines[rowIdx]!;

    for (let colIdx = 0; colIdx < colCount; colIdx++) {
      const nextChar = nextLine[colIdx]!;
      const isDigit = REGEX_DIGIT.test(nextChar);
      const isPeriod = nextChar === '.';
      const isSymbol = !isDigit && !isPeriod;

      if (isDigit) {
        if (numberBuffer === undefined) {
          numberBuffer = nextChar;
          numberCol = colIdx;
        } else {
          numberBuffer += nextChar;
        }
      } else {
        if (numberBuffer !== undefined) {
          storeNumber(rowIdx);
        }

        if (isSymbol) {
          symbols.set(
            toPos({
              col: colIdx,
              row: rowIdx,
            }),
            nextChar,
          );
        }
      }
    }

    if (numberBuffer !== undefined) {
      storeNumber(rowIdx);
    }
  }

  return { numbers, symbols };
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;

  const { numbers, symbols } = parseData(dataToUse);

  const numbersNextToSymbols: number[] = [];
  for (const nextSymbolPos of symbols.keys()) {
    const { row: symbolRow, col: symbolCol } = fromPos(nextSymbolPos);

    for (let col = symbolCol - 1; col <= symbolCol + 1; col++) {
      for (let row = symbolRow - 1; row <= symbolRow + 1; row++) {
        const nextNumberPos = toPos({ col, row });
        const numberAtPos = numbers.get(nextNumberPos);
        if (numberAtPos?.used === false) {
          numbersNextToSymbols.push(numberAtPos.number);
          numberAtPos.used = true;
        }
      }
    }
  }

  const totalOfValidNumbers = numbersNextToSymbols.reduce(
    (prev, next) => prev + next,
    0,
  );

  logAnswer({
    answer: totalOfValidNumbers,
    expected: USE_TEST_DATA ? 4_361 : 528_799,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;

  const { numbers, symbols } = parseData(dataToUse);

  const gearRatios: number[] = [];
  for (const [nextSymbolPos, nextSymbolChar] of symbols.entries()) {
    if (nextSymbolChar !== '*') {
      continue;
    }

    const { row: symbolRow, col: symbolCol } = fromPos(nextSymbolPos);
    const adjacentNumbers: NumberEntry[] = [];

    for (let col = symbolCol - 1; col <= symbolCol + 1; col++) {
      for (let row = symbolRow - 1; row <= symbolRow + 1; row++) {
        const nextNumberPos = toPos({ col, row });
        const numberAtPos = numbers.get(nextNumberPos);
        if (numberAtPos?.used === false) {
          adjacentNumbers.push(numberAtPos);
          numberAtPos.used = true;
        }
      }
    }

    // Reset the numbers so they can be re-used by other gears
    for (const nextNumber of adjacentNumbers) {
      nextNumber.used = false;
    }

    if (adjacentNumbers.length === 2) {
      const [firstGear, secondGear] = adjacentNumbers;
      const gearRatio = firstGear!.number * secondGear!.number;

      gearRatios.push(gearRatio);
    }
  }

  const totalOfGearRatios = gearRatios.reduce((prev, next) => prev + next, 0);

  logAnswer({
    answer: totalOfGearRatios,
    expected: USE_TEST_DATA ? 467_835 : 84_907_174,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
