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

const findSteps = (input: number[]): { allSame: boolean; steps: number[] } => {
  let allSame = true;
  const steps: number[] = [];

  let prevVal: number | undefined;
  for (const nextVal of input) {
    if (prevVal !== undefined) {
      const nextInterval = nextVal - prevVal;
      steps.push(nextInterval);
      if (allSame && nextInterval !== steps[0]) {
        allSame = false;
      }
    }

    prevVal = nextVal;
  }

  return { allSame, steps };
};

const extrapolateValues = (input: number[]): [number, number] => {
  const { steps, allSame } = findSteps(input);

  let nextStep: number | undefined;
  let prevStep: number | undefined;
  if (allSame) {
    nextStep = steps.at(-1)!;
    prevStep = steps.at(0)!;
  } else {
    [prevStep, nextStep] = extrapolateValues(steps);
  }

  const nextVal = nextStep + input.at(-1)!;
  const prevVal = input.at(0)! - prevStep;

  return [prevVal, nextVal];
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  let total = 0;
  for (const nextLine of lines) {
    const vals: number[] = nextLine
      .split(' ')
      .map((val) => Number.parseInt(val, 10));

    const [, nextVal] = extrapolateValues(vals);
    total += nextVal;
  }

  logAnswer({
    answer: total,
    expected: USE_TEST_DATA ? 114 : 1_938_800_261,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  let total = 0;
  for (const nextLine of lines) {
    const vals: number[] = nextLine
      .split(' ')
      .map((val) => Number.parseInt(val, 10));

    const [prevVal] = extrapolateValues(vals);
    total += prevVal;
  }

  logAnswer({
    answer: total,
    expected: USE_TEST_DATA ? 2 : 1_112,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
