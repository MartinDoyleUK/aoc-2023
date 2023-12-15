/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer, reverseString } from '../../utils';

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

    // Check first row for possible horizontal symmetry (i.e. vertical mirror)
    let nextFirstRow: string | undefined = patternRows.shift()!;
    const lineLength = nextFirstRow.length;
    const halfwayPoint = lineLength / 2;
    let possibleSymmetryCols = [];
    const colsToLeft: string[] = [nextFirstRow[0]!];
    for (let col = 1; col < lineLength; col++) {
      const nextChar = nextFirstRow[col]!;
      const overHalfway = col >= halfwayPoint;
      const reflection = colsToLeft.join('');
      const restOfLine = nextFirstRow.slice(col);
      const isReflection = overHalfway
        ? reflection.startsWith(restOfLine)
        : restOfLine.startsWith(reflection);
      if (isReflection) {
        possibleSymmetryCols.push(col);
      }
      colsToLeft.unshift(nextChar);
    }

    const rowsAbove: string[] = [nextFirstRow];
    while ((nextFirstRow = patternRows[0])) {
      if (nextFirstRow === rowsAbove[0]) {
        let hasVerticalSymmetry = true;
        for (let i = 1; i < rowsAbove.length && i < patternRows.length; i++) {
          if (rowsAbove[i] !== patternRows[i]) {
            hasVerticalSymmetry = false;
            break;
          }
        }
        if (hasVerticalSymmetry) {
          rowsAboveSymmetry = rowsAbove.length;
          break;
        }
      }

      // console.log(
      //   `Checking horizontal symmetry for line "${nextFirstRow}" in columns [${possibleSymmetryCols}]`,
      // );

      const noSymmetryCols: number[] = [];
      for (const nextCol of possibleSymmetryCols) {
        const overHalfway = nextCol >= halfwayPoint;
        const reflection = overHalfway
          ? reverseString(
              nextFirstRow.slice(nextCol - (lineLength - nextCol), nextCol),
            )
          : reverseString(nextFirstRow.slice(0, nextCol));
        const restOfLine = overHalfway
          ? nextFirstRow.slice(nextCol)
          : nextFirstRow.slice(nextCol, nextCol * 2);
        const isReflection = overHalfway
          ? reflection.startsWith(restOfLine)
          : restOfLine.startsWith(reflection);

        if (!isReflection) {
          noSymmetryCols.push(nextCol);
        }

        // console.log(`For possibly symmetry col ${nextCol} ...
        // lineLength = ${lineLength}
        // halfwayPoint = ${halfwayPoint}
        // overHalfway = ${overHalfway}
        // reflection = ${reflection}
        // restOfLine = ${restOfLine}
        // isReflection = ${isReflection}
        // `);
      }
      possibleSymmetryCols = possibleSymmetryCols.filter(
        (col) => !noSymmetryCols.includes(col),
      );

      rowsAbove.unshift(patternRows.shift()!);
      nextFirstRow = patternRows[0];

      if (nextFirstRow === undefined && possibleSymmetryCols.length === 1) {
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
    expected: USE_TEST_DATA ? 405 : undefined,
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
