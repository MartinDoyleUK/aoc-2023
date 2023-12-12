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

  let totalCombinations = 0;
  for (const nextLine of lines) {
    const [input, counts] = nextLine.split(' ') as [string, string];

    // Construct regex for testing the possibilities
    const countsRegexBuilder: string[] = [];
    for (const nextCount of counts.split(',')) {
      if (countsRegexBuilder.length) {
        countsRegexBuilder.push(`0+`);
      }
      if (nextCount === '1') {
        countsRegexBuilder.push(`1`);
      } else {
        countsRegexBuilder.push(`1{${nextCount}}`);
      }
    }
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation
    const regexString = `^0*${countsRegexBuilder.join('')}0*$`;
    const lineRegex = new RegExp(regexString, 'u');

    // Convert to zeros and ones for easier binary replacement
    const record = input.replaceAll('.', '0').replaceAll('#', '1');

    // Count the placeholders
    const numUnknowns = record.split('?').length - 1;

    // console.log(
    //   `line of "${nextLine}" has ${numUnknowns} unknowns and gives regex of ${lineRegex} and record of "${record}"`,
    // );
    // console.log(`line of "${nextLine}" has ${numUnknowns} unknowns`);

    // Try all the combinations of values and test each time
    let lineCombinations = 0;
    const maxValue = 2 ** numUnknowns - 1;
    const padLength = maxValue.toString(2).length;
    // const validCombinations: string[] = [];
    // const invalidCombinations: string[] = [];
    for (let i = 0; i < 2 ** numUnknowns; i++) {
      const replacements = i.toString(2).padStart(padLength, '0').split('');
      const replaced = record.replaceAll('?', () => replacements.shift()!);
      if (lineRegex.test(replaced)) {
        // validCombinations.push(replaced);
        lineCombinations++;
        // } else {
        //   invalidCombinations.push(replaced);
      }
    }

    //     console.log(
    //       `
    // line "${nextLine}" has ${validCombinations.length
    //       } valid combinations using regex ${lineRegex}
    // VALID
    // ${validCombinations.join('\n')}
    // INVALID
    // ${invalidCombinations.join('\n')}`,
    //     );

    totalCombinations += lineCombinations;
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
