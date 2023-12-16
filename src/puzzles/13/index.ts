/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer, memoize, reverseString } from '../../utils';

// Toggle this to use test or real data
const USE_TEST_DATA = true;

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

      //     console.log(`Checking row "${row}" for possible symmetry in col ${nextCol} ...
      // patternWidth = ${patternWidth}
      // overHalfway = ${overHalfway}
      // reflection = ${reflection}
      // restOfLine = ${restOfLine}
      // isReflection = ${isReflection}
      //     `);
    }

    const cleanedCols = colsToCheck.filter(
      (nextCol) => !colsWithoutSymmetry.includes(nextCol),
    );

    // console.log(`[${colsToCheck}] -> [${cleanedCols}]`);

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

// Run task one
// eslint-disable-next-line complexity
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const patterns = dataToUse
    .split('\n\n')
    .map((lines) => lines.split('\n').filter((line) => line.trim().length > 0));
  // console.log('');

  let totalSum = 0;
  for (let patternIdx = 0; patternIdx < patterns.length; patternIdx++) {
    const patternRows = patterns[patternIdx]!.slice();
    let colsLeftOfSymmetry = 0;
    let rowsAboveSymmetry = 0;

    //     console.log(`
    // Pattern ${patternIdx + 1}:

    //   ${patternRows.join('\n  ')}
    // `);

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
          // console.log(`Found up-down symmetry at row ${symmetryRow}`);
          rowsAboveSymmetry = symmetryRow;
          break;
        }
      }

      // console.log(
      //   `Checking horizontal symmetry for line "${nextRow}" in columns [${possibleSymmetryCols}]`,
      // );

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

    // Add values for this pattern
    if (colsLeftOfSymmetry > 0) {
      //     const rows = patterns[patternIdx]!.map((nextRow) => {
      //       const beforeMirror = nextRow.slice(0, colsLeftOfSymmetry);
      //       const afterMirror = nextRow.slice(colsLeftOfSymmetry);

      //       return `${beforeMirror} | ${afterMirror}`;
      //     });
      //     console.log(`  ***** NEXT PATTERN *****

      // ${rows.join('\n  ')}

      // Pattern #${
      //   patternIdx + 1
      // } has LEFT-RIGHT symmetry at COLUMN ${colsLeftOfSymmetry}`);
      totalSum += colsLeftOfSymmetry;
    } else if (rowsAboveSymmetry > 0) {
      //     const rows = patterns[patternIdx]!;
      //     rows.splice(
      //       rowsAboveSymmetry,
      //       0,
      //       '',
      //       Array.from({ length: lineLength }).fill('-').join(''),
      //       '',
      //     );
      //     console.log(`  ***** NEXT PATTERN *****

      // ${rows.join('\n  ')}

      // Pattern #${patternIdx + 1} has UP-DOWN symmetry at ROW ${rowsAboveSymmetry}`);
      totalSum += 100 * rowsAboveSymmetry;
    }
    // console.log('');
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
