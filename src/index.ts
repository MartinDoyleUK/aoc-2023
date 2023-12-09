import fs from 'node:fs/promises';
import path from 'node:path';
// import process from 'node:process';

import {
  logComplete,
  logError,
  logPuzzleDay,
  logStart,
  logTime,
} from './utils';

const HERE = path.dirname(import.meta.url).slice('file:'.length);
const DAY_REGEX = /(\d{2})$/u;

const sortStringsNumerically = (a: string, b: string) => {
  const aNum = Number.parseInt(a, 10);
  const bNum = Number.parseInt(b, 10);
  return aNum - bNum;
};

const run = async () => {
  const [runAllArg] = process.argv.slice(2);
  const runAll = runAllArg === '--runAll';

  // Get all of the puzzle days
  const puzzlesPath = path.join(HERE, 'puzzles');
  const puzzleDays = (await fs.readdir(puzzlesPath)).sort(
    sortStringsNumerically,
  );

  // Get the paths to the puzzles
  const allPuzzlePaths = [];
  for (const nextDay of puzzleDays) {
    if (nextDay === 'TEMPLATE') {
      continue;
    }
    const nextDayPath = path.join(puzzlesPath, nextDay);
    allPuzzlePaths.push(nextDayPath);
  }

  // Run through puzzles
  logStart();
  const beforeAll = performance.now();
  const startIndex = runAll ? 0 : allPuzzlePaths.length - 1;
  const endIndex = allPuzzlePaths.length;
  for (let index = startIndex; index < endIndex; index++) {
    const nextPuzzlePath = allPuzzlePaths[index]!;
    const relativePath = `./${path.relative(HERE, nextPuzzlePath)}`;
    const [, day] = DAY_REGEX.exec(relativePath)!;
    const { runTasks } = await import(relativePath);
    logPuzzleDay(day!, index === startIndex);
    const before = performance.now();
    await runTasks();
    logTime(before, day!);
  }

  // Finish up with nice message
  logComplete(beforeAll);
};

run().catch((error) => {
  logError('Error running program', error);
});
