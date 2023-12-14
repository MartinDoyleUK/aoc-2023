/* eslint-disable @typescript-eslint/prefer-for-of */
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

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  //   console.log(`lines:

  //   ${lines.join('\n  ')}
  // `);

  const cols: string[][] = Array.from({ length: lines[0]!.length }).map(
    () => [],
  );
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const nextRow = lines[lineIdx]!;
    for (let colIdx = 0; colIdx < nextRow.length; colIdx++) {
      const nextChar = nextRow[colIdx]!;
      cols[colIdx]!.push(nextChar);
    }
  }

  //   console.log(`cols:

  //   ${cols.map((col) => col.join('')).join('\n  ')}
  // `);

  let total = 0;
  const values = cols[0]!.map((_, idx) => idx + 1).reverse();
  // console.log(`values: [${values}]`);
  for (const nextCol of cols) {
    let columnValue = 0;
    const groups = nextCol.join('').split('#');
    //     console.log(`
    // groups: [${groups.join('], [')}]`);
    let groupOffset = 0;
    for (const [, nextGroup] of groups.entries()) {
      const numRocks = nextGroup.replaceAll('.', '').length;
      const groupValue = values
        .slice(groupOffset, groupOffset + numRocks)
        .reduce((prev, next) => prev + next, 0);
      // console.log(`nextGroup: "${nextGroup}"`, {
      //   groupOffset,
      //   groupValue,
      //   numRocks,
      // });

      columnValue += groupValue;
      groupOffset += nextGroup.length + 1;
    }

    // console.log(`Column "${nextCol.join('')}" has value ${columnValue}`);
    total += columnValue;
  }

  logAnswer({
    answer: total,
    expected: USE_TEST_DATA ? 136 : undefined,
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
