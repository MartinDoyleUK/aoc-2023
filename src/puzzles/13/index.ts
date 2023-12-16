/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer, memoize, reverseString } from '../../utils';

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

const checkRowForLeftRightSymmetry = memoize(
  ({
    colsToCheck,
    patternWidth,
    row,
  }: {
    colsToCheck: number[];
    patternWidth: number;
    row: string;
  }): number[] => {
    const colsWithoutSymmetry: number[] = [];
    for (const nextCol of colsToCheck) {
      const overHalfway = nextCol >= patternWidth / 2;
      const reflection = overHalfway
        ? reverseString(row.slice(nextCol - (patternWidth - nextCol), nextCol))
        : reverseString(row.slice(0, nextCol));
      const restOfLine = overHalfway
        ? row.slice(nextCol)
        : row.slice(nextCol, nextCol * 2);
      const isReflection = restOfLine === reflection;

      if (!isReflection) {
        colsWithoutSymmetry.push(nextCol);
      }
    }

    const cleanedCols = colsToCheck.filter(
      (nextCol) => !colsWithoutSymmetry.includes(nextCol),
    );

    return cleanedCols;
  },
);

const checkForUpDownSymmetry = memoize(
  ({
    rowsAbove,
    rowsBelow,
  }: {
    rowsAbove: string[];
    rowsBelow: string[];
  }): number | undefined => {
    let hasUpDownSymmetry = true;

    for (let i = 1; i < rowsAbove.length && i < rowsBelow.length; i++) {
      if (rowsAbove[i] !== rowsBelow[i]) {
        hasUpDownSymmetry = false;
        break;
      }
    }

    return hasUpDownSymmetry ? rowsAbove.length : undefined;
  },
);

const getAllVariants = (pattern: string[]): string[][] => {
  const variants: string[][] = [];

  const patternString = pattern.join('|');
  //   console.log(`
  // For pattern string:
  //   ${patternString}
  // Variants:`);

  for (let i = 0; i < patternString.length; i++) {
    if (patternString.charAt(i) === '|') {
      continue;
    }

    const firstHalf = patternString.slice(0, i);
    const flippedChar = patternString.charAt(i) === '#' ? '.' : '#';
    const secondHalf = patternString.slice(i + 1);
    const variantString = `${firstHalf}${flippedChar}${secondHalf}`;
    // console.log(`  ${variantString}`);

    variants.push(variantString.split('|'));
  }

  return variants;
};

const checkPatternForSymmetry = (
  pattern: string[],
): {
  colsLeftOfSymmetry?: number;
  rowsAboveSymmetry?: number;
} => {
  const patternRows = pattern.slice();
  let colsLeftOfSymmetry: number | undefined;
  let rowsAboveSymmetry: number | undefined;

  const firstRow = patternRows.shift()!;
  const patternWidth = firstRow.length;
  const startingColsToCheck = Array.from({ length: patternWidth - 1 }).map(
    (_, idx) => idx + 1,
  );
  let possibleSymmetryCols = checkRowForLeftRightSymmetry({
    colsToCheck: startingColsToCheck,
    patternWidth,
    row: firstRow,
  });

  const rowsAbove: string[] = [firstRow];
  let nextRow: string | undefined;
  while ((nextRow = patternRows[0])) {
    if (nextRow === rowsAbove[0]) {
      const symmetryRow = checkForUpDownSymmetry({
        rowsAbove,
        rowsBelow: patternRows,
      });

      if (symmetryRow !== undefined) {
        rowsAboveSymmetry = symmetryRow;
        break;
      }
    }

    possibleSymmetryCols = checkRowForLeftRightSymmetry({
      colsToCheck: possibleSymmetryCols,
      patternWidth,
      row: nextRow,
    });

    rowsAbove.unshift(patternRows.shift()!);
    nextRow = patternRows[0];

    if (nextRow === undefined && possibleSymmetryCols.length === 1) {
      colsLeftOfSymmetry = possibleSymmetryCols[0]!;
    }
  }

  return { colsLeftOfSymmetry, rowsAboveSymmetry };
};

// Run task one
// eslint-disable-next-line complexity
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const patterns = dataToUse
    .split('\n\n')
    .map((lines) => lines.split('\n').filter((line) => line.trim().length > 0));

  let totalSum = 0;
  for (let patternIdx = 0; patternIdx < patterns.length; patternIdx++) {
    const nextPattern = patterns[patternIdx]!;
    const { colsLeftOfSymmetry, rowsAboveSymmetry } =
      checkPatternForSymmetry(nextPattern);

    // Add values for this pattern
    if (colsLeftOfSymmetry) {
      totalSum += colsLeftOfSymmetry;
    } else if (rowsAboveSymmetry) {
      totalSum += 100 * rowsAboveSymmetry;
    }
  }

  logAnswer({
    answer: totalSum,
    expected: USE_TEST_DATA ? 405 : 35_538,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const patterns = dataToUse
    .split('\n\n')
    .map((lines) => lines.split('\n').filter((line) => line.trim().length > 0));

  let totalSum = 0;
  for (let patternIdx = 0; patternIdx < patterns.length; patternIdx++) {
    const basePattern = patterns[patternIdx]!;
    const { colsLeftOfSymmetry: baseCols, rowsAboveSymmetry: baseRows } =
      checkPatternForSymmetry(basePattern);
    const patternVariants = getAllVariants(basePattern);

    for (
      let variantIdx = 0;
      variantIdx < patternVariants.length;
      variantIdx++
    ) {
      const nextPattern = patternVariants[variantIdx]!;
      const { colsLeftOfSymmetry, rowsAboveSymmetry } =
        checkPatternForSymmetry(nextPattern);

      // Add values for this pattern
      if (colsLeftOfSymmetry && colsLeftOfSymmetry !== baseCols) {
        // console.log(
        //   `Found left-right symmetry in variant ${variantIdx} at column ${colsLeftOfSymmetry}`,
        // );
        totalSum += colsLeftOfSymmetry;
        break;
      } else if (rowsAboveSymmetry && rowsAboveSymmetry !== baseRows) {
        // console.log(
        //   `Found up-down symmetry in variant ${variantIdx} at row ${rowsAboveSymmetry}`,
        // );
        totalSum += 100 * rowsAboveSymmetry;
        break;
      }
    }
  }

  logAnswer({
    answer: totalSum,
    expected: USE_TEST_DATA ? 400 : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
