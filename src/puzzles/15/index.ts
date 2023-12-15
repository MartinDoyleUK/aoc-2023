/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer, memoize } from '../../utils';

interface Lens {
  focalLength: number;
  label: string;
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

const hash = memoize((input: string): number => {
  let hashed = 0;
  for (let i = 0; i < input.length; i++) {
    hashed = ((hashed + input.codePointAt(i)!) * 17) % 256;
  }
  return hashed;
});

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  // eslint-disable-next-line unicorn/prefer-array-find
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const steps = lines[0]!.split(',');
  const result = steps.reduce((prev, next) => prev + hash(next), 0);

  logAnswer({
    answer: result,
    expected: USE_TEST_DATA ? 1_320 : 507_291,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  // eslint-disable-next-line unicorn/prefer-array-find
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const steps = lines[0]!.split(',');
  const boxes: Lens[][] = [];

  for (const nextStep of steps) {
    const [label, focalLength] = nextStep.split(/[=-]/u) as [string, string];

    // // eslint-disable-next-line canonical/sort-keys
    // console.log({ label, focalLength });

    const boxIdx = hash(label);
    const boxLenses = boxes[boxIdx] ?? ([] as Lens[]);

    let foundLens = false;
    const updatedLenses = boxLenses.filter((nextLens) => {
      let keepLens = true;
      if (nextLens.label === label) {
        foundLens = true;
        if (focalLength === '') {
          // console.log(`Removing lens ${label} from box ${boxIdx}`);
          keepLens = false;
        } else {
          // console.log(
          //   `Updating focal length of lens ${label} in box ${boxIdx} to ${focalLength}`,
          // );
          nextLens.focalLength = Number.parseInt(focalLength, 10);
        }
      }
      return keepLens;
    });

    if (!foundLens) {
      if (focalLength === '') {
        // console.log(
        //   `Couldn't find lens with label ${label} in box ${boxIdx} so doing nothing`,
        // );
      } else {
        // console.log(
        //   `Adding lens ${label} with focal length ${focalLength} to box ${boxIdx}`,
        // );
        updatedLenses.push({
          focalLength: Number.parseInt(focalLength, 10),
          label,
        });
      }
    }

    boxes[boxIdx] = updatedLenses;
  }

  // console.log(boxes);

  let allBoxes = 0;
  for (let i = 0; i < boxes.length; i++) {
    const nextBox = boxes[i];
    if (nextBox === undefined) {
      continue;
    }

    let boxTotal = 0;
    for (let j = 0; j < nextBox.length; j++) {
      const nextLens = nextBox[j]!;
      boxTotal += (i + 1) * (j + 1) * nextLens.focalLength;
    }

    allBoxes += boxTotal;
  }

  logAnswer({
    answer: allBoxes,
    expected: USE_TEST_DATA ? 145 : undefined,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
