/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

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

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  let totalCombinations = 0;
  for (const nextLine of lines) {
    console.log(`nextLine = "${nextLine}"`);

    const [input, counts] = nextLine.split(' ') as [string, string];
    const countNums = counts.split(',').map((s) => Number.parseInt(s, 10));
    let combinations = 0;

    const inputGroups = input.replaceAll(/\.+/gu, ' ').trim().split(' ');
    for (const nextInputGroup of inputGroups) {
      const hasUnknowns = nextInputGroup.includes('?');
      const groupSize = nextInputGroup.length;
      const includedCounts: number[] = [countNums.shift()!];

      let minGroupLength = -1;
      let hasEnoughCounts = false;
      while (!hasEnoughCounts) {
        minGroupLength =
          includedCounts.reduce((prev, next) => prev + next, 0) +
          includedCounts.length -
          1;
        console.log({ groupSize, minGroupLength });
        if (
          countNums.length === 0 ||
          minGroupLength + countNums[0]! + 1 > groupSize
        ) {
          hasEnoughCounts = true;
        } else {
          includedCounts.push(countNums.shift()!);
        }
      }

      console.log({
        hasUnknowns,
        includedCounts,
        minGroupLength,
        nextInputGroup,
      });

      if (!hasUnknowns) {
        console.log('Has no unknowns - skipping');
        continue;
      }

      if (groupSize === minGroupLength) {
        console.log('Group size matches input groups - skipping');
        continue;
      }

      const numSpaces = groupSize - minGroupLength;
      combinations += numSpaces + 1;

      // console.log({
      //   includedCounts,
      //   minGroupLength,
      //   nextInputGroup,
      //   numSpaces,
      // });
    }

    console.log(`line has ${combinations} valid combinations
`);

    totalCombinations += combinations || 1;
    // totalCombinations += validCombinations.length;
  }

  logAnswer({
    answer: totalCombinations,
    expected: USE_TEST_DATA ? 21 : 7_169,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const totalCombinations = lines.length;

  logAnswer({
    answer: totalCombinations,
    expected: USE_TEST_DATA ? 525_152 : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
