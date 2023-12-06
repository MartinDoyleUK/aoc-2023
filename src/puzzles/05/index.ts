/* eslint-disable id-length */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

import { TransformMap } from './transform-map';

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

// Test constants
const REGEX = {
  MappingInfo: /^(\d+) (\d+) (\d+)$/u,
  MapTitle: /^([a-z]+)-to-([a-z]+) map:$/u,
  Seeds: /^seeds: (.+)$/u,
};

const parseLines = (lines: string[], seedNumsAreRange = false) => {
  const seedRanges: [number, number][] = [];
  const transformMaps: TransformMap[] = [];
  let nextTransformMap: TransformMap | undefined;
  for (const nextLine of lines) {
    let match: RegExpExecArray | null;
    if ((match = REGEX.Seeds.exec(nextLine))) {
      const [, seedNums] = match;
      const mappedSeedNums = seedNums!.split(' ').map((nextSeed) => Number.parseInt(nextSeed, 10));
      if (seedNumsAreRange) {
        while (mappedSeedNums.length > 0) {
          const start = mappedSeedNums.shift()!;
          const length = mappedSeedNums.shift()!;
          seedRanges.push([start, length]);
        }
      } else {
        seedRanges.push(...mappedSeedNums.map((nextSeed) => [nextSeed, 1] as [number, number]));
      }
    } else if ((match = REGEX.MapTitle.exec(nextLine))) {
      const [, source, dest] = match;
      if (nextTransformMap !== undefined) {
        transformMaps.push(nextTransformMap);
      }
      nextTransformMap = new TransformMap(source!, dest!);
    } else if ((match = REGEX.MappingInfo.exec(nextLine))) {
      const [, destStart, sourceStart, rangeLength] = match.map((nextVal) => Number.parseInt(nextVal!, 10)) as [
        unknown,
        number,
        number,
        number,
      ];
      nextTransformMap!.addRange(destStart, sourceStart, rangeLength);
    } else {
      throw new Error(`Line did not match any expected format: "${nextLine}"`);
    }
  }

  // Add final map
  transformMaps.push(nextTransformMap!);

  return {
    seedRanges,
    transformMaps,
  };
};

const findLowestLocation = (seedRanges: [number, number][], transformMaps: TransformMap[]) => {
  const reversedMaps = transformMaps.slice().reverse();
  let lowestLocation: number | undefined;

  let testLocation = 0;
  while (lowestLocation === undefined) {
    let potentialSeedNum = testLocation;
    for (const nextMap of reversedMaps) {
      potentialSeedNum = nextMap.mapValReverse(potentialSeedNum);
    }

    for (const [rangeStart, rangeLength] of seedRanges) {
      if (potentialSeedNum >= rangeStart && potentialSeedNum <= rangeStart + rangeLength) {
        lowestLocation = testLocation;
      }
    }

    testLocation++;
  }

  console.log('seedRanges', seedRanges);
  for (const [nextStartingSeed, nextSeedRangeLength] of seedRanges) {
    for (let nextSeedNum = nextStartingSeed; nextSeedNum < nextStartingSeed + nextSeedRangeLength; nextSeedNum++) {
      const transformations: number[] = [nextSeedNum];
      // const before = performance.now();
      for (const nextMap of transformMaps) {
        const lastVal = transformations.at(-1)!;
        transformations.push(nextMap.mapVal(lastVal));
      }
      // const timeTaken = performance.now() - before;
      // console.log(`${timeTaken}ms`);

      // console.log(transformations.join(' -> '));

      const nextLocation = transformations.at(-1)!;
      if (nextLocation < lowestLocation) {
        lowestLocation = nextLocation;
      }
    }
  }

  return lowestLocation;
};

// Run task one
const runOne = () => {
  const taskStarted = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .map((line) => line.toLowerCase().trim())
    .filter((line) => line.length > 0);

  const { seedRanges, transformMaps } = parseLines(lines);
  const lowestLocation = findLowestLocation(seedRanges, transformMaps);

  logAnswer(1, taskStarted, lowestLocation, USE_TEST_DATA ? 35 : 650_599_855);
};

// Run task two
const runTwo = () => {
  const taskStarted = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .map((line) => line.toLowerCase().trim())
    .filter((line) => line.length > 0);

  const { seedRanges, transformMaps } = parseLines(lines, true);
  const lowestLocation = findLowestLocation(seedRanges, transformMaps);

  logAnswer(2, taskStarted, lowestLocation, USE_TEST_DATA ? 46 : undefined);
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
