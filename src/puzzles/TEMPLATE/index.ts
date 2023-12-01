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
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  logAnswer(1, lines.length, USE_TEST_DATA ? undefined : undefined);
};

// Run task two
const runTwo = () => {
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  logAnswer(2, lines.length, USE_TEST_DATA ? undefined : undefined);
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
