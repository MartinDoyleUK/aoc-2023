/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import {
  findTransitionByIndex,
  getBinaryCandidate,
  logAnswer,
} from '../../utils';

interface FindSuccessCandidateArgs {
  lower: number;
  predicate: (input: number) => boolean;
  upper: number;
}

type FindSuccessCandidateFn = (args: FindSuccessCandidateArgs) => {
  highest: number;
  lowest: number;
};

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

const getDistanceForTime = (press: number, race: number) => {
  const travelTime = race - press;
  const travelDistance = travelTime * press;

  return travelDistance;
};

const findSuccessfulRange: FindSuccessCandidateFn = ({
  lower,
  upper,
  predicate,
}) => {
  let firstSuccessful: number | undefined;
  let candidate = getBinaryCandidate(lower, upper);
  let up = true;
  while (firstSuccessful === undefined) {
    if (candidate === upper) {
      up = false;
    } else if (candidate === lower) {
      throw new Error(`Unable to find success in range ${lower}->${upper}`);
    } else if (predicate(candidate)) {
      firstSuccessful = candidate;
      break;
    }

    candidate = up
      ? getBinaryCandidate(candidate, upper)
      : getBinaryCandidate(candidate, lower);
  }

  const reversePredicate = (input: number) => !predicate(input);
  const startOfSuccess = findTransitionByIndex({
    lower,
    predicate,
    upper: candidate,
  });
  const startOfFailure = findTransitionByIndex({
    lower: candidate,
    predicate: reversePredicate,
    upper,
  });

  return { highest: startOfFailure! - 1, lowest: startOfSuccess! };
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .map((line) => line.trim().replaceAll(/ {2,}/gu, ' '))
    .filter((line) => line.length > 0);

  const [, ...rawTimes] = lines[0]!.split(' ');
  const [, ...rawDistances] = lines[1]!.split(' ');

  const winningOptionsPerRace: number[] = [];
  for (let i = 0; i < rawTimes.length; i++) {
    const nextRaceTime = Number.parseInt(rawTimes[i]!, 10);
    const nextRecordDistance = Number.parseInt(rawDistances[i]!, 10);

    const { highest, lowest } = findSuccessfulRange({
      lower: 0,
      predicate: (input) =>
        getDistanceForTime(input, nextRaceTime) > nextRecordDistance,
      upper: nextRaceTime,
    });

    const numWinningTimes = highest - lowest + 1;
    winningOptionsPerRace.push(numWinningTimes);
  }

  const marginForError = winningOptionsPerRace.reduce(
    (prev, next) => prev * next,
    1,
  );

  logAnswer({
    answer: marginForError,
    expected: USE_TEST_DATA ? 288 : 633_080,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .map((line) => line.trim().replaceAll(' ', ''))
    .filter((line) => line.length > 0);

  const [, rawTime] = lines[0]!.split(':');
  const [, rawDistance] = lines[1]!.split(':');
  const raceTime = Number.parseInt(rawTime!, 10);
  const recordDistance = Number.parseInt(rawDistance!, 10);

  const { highest, lowest } = findSuccessfulRange({
    lower: 0,
    predicate: (input) => getDistanceForTime(input, raceTime) > recordDistance,
    upper: raceTime,
  });

  const numWinningTimes = highest - lowest + 1;

  logAnswer({
    answer: numWinningTimes,
    expected: USE_TEST_DATA ? 71_503 : 20_048_741,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
