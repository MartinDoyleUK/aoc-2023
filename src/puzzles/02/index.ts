/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

interface GameResult {
  gameNumber: number;
  isPossible: boolean;
  minCubes: CubeCounts;
  minCubesPower: number;
}

type CubeColour = 'red' | 'green' | 'blue';

type CubeCounts = Record<CubeColour, number>;

type GetGameResultFn = (inputLine: string) => GameResult | undefined;

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

// Puzzle setup
const REGEX_LINE = /^Game (\d+): (.+)$/u;
const MAXIMUMS: CubeCounts = {
  blue: 14,
  green: 13,
  red: 12,
};

const getGameResult: GetGameResultFn = (inputLine) => {
  const [, gameId, gameData] = REGEX_LINE.exec(inputLine) ?? [];
  if (gameId === undefined || gameData === undefined) {
    return undefined;
  }

  const minCubes: CubeCounts = {
    blue: 0,
    green: 0,
    red: 0,
  };

  const rounds = gameData.split('; ');
  let isPossible = true;
  for (const nextRound of rounds) {
    const cubes = nextRound.split(', ');
    for (const nextCube of cubes) {
      const [count, colour] = nextCube.split(' ');
      if (count === undefined || colour === undefined) {
        throw new Error(`Unable to get cubes information for "${nextCube}"`);
      }

      const colourValue = colour as CubeColour;
      const countValue = Number.parseInt(count, 10);
      if (countValue > MAXIMUMS[colourValue]) {
        isPossible = false;
      }
      if (countValue > minCubes[colourValue]) {
        minCubes[colourValue] = countValue;
      }
    }
  }

  const gameNumber = Number.parseInt(gameId, 10);
  const minCubesPower = Object.values(minCubes).reduce(
    (prev, next) => prev * next,
    1,
  );

  return {
    gameNumber,
    isPossible,
    minCubes,
    minCubesPower,
  };
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const validGames = lines
    .map((nextLine) => getGameResult(nextLine))
    .filter(
      (nextResult) => nextResult !== undefined && nextResult.isPossible,
    ) as GameResult[];
  const totalOfValidGames = validGames.reduce(
    (prev, next) => prev + next!.gameNumber,
    0,
  );

  logAnswer({
    answer: totalOfValidGames,
    expected: USE_TEST_DATA ? 8 : 2_486,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const gameResults = lines
    .map((nextLine) => getGameResult(nextLine))
    .filter((nextResult) => nextResult !== undefined) as GameResult[];

  const totalOfCubePowers = gameResults.reduce(
    (prev, next) => prev + next!.minCubesPower,
    0,
  );

  logAnswer({
    answer: totalOfCubePowers,
    expected: USE_TEST_DATA ? 2_286 : 87_984,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
