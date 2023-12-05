/* eslint-disable id-length */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

import { TransformMap } from './transform-map';

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

// Test constants
const REGEX = {
  MappingInfo: /^(\d+) (\d+) (\d+)$/u,
  MapTitle: /^([a-z]+)-to-([a-z]+) map:$/u,
  Seeds: /^seeds: (.+)$/u,
};

const createRangeArray = (start: number, length: number) => Array.from({ length }, (_, nextSeed) => nextSeed + start);

const parseLines = (lines: string[], seedNumsAreRange = false) => {
  let allSeedNums: number[] | undefined; // Allow it to be used later without warnings about initialisation
  const transformMaps: TransformMap[] = [];
  let nextTransformMap: TransformMap | undefined;
  for (const nextLine of lines) {
    let match: RegExpExecArray | null;
    if ((match = REGEX.Seeds.exec(nextLine))) {
      const [, seedNums] = match;
      const mappedSeedNums = seedNums!.split(' ').map((nextSeed) => Number.parseInt(nextSeed, 10));
      if (seedNumsAreRange) {
        allSeedNums = [];
        for (let i = 0; i < mappedSeedNums!.length; i++) {
          const firstNum = mappedSeedNums![i++]!;
          const rangeLength = mappedSeedNums![i]!;
          const range = createRangeArray(firstNum, rangeLength);

          // console.log({ firstNum, range, rangeLength });

          allSeedNums.push(...range);
        }
      } else {
        allSeedNums = mappedSeedNums;
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

  // Make sure we have seeds
  if (allSeedNums === undefined) {
    throw new Error("Didn't find any seeds!");
  }

  return {
    seedNums: allSeedNums,
    transformMaps,
  };
};

const findLowestLocation = (seedNums: number[], transformMaps: TransformMap[]) => {
  let lowestLocation = Number.MAX_SAFE_INTEGER;
  for (const nextSeedNum of seedNums) {
    const transformations: number[] = [nextSeedNum];
    for (const nextMap of transformMaps) {
      const lastVal = transformations.at(-1)!;
      transformations.push(nextMap.mapVal(lastVal));
    }

    // console.log(transformations.join(' -> '));

    const nextLocation = transformations.at(-1)!;
    if (nextLocation < lowestLocation) {
      lowestLocation = nextLocation;
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

  const { seedNums, transformMaps } = parseLines(lines);
  const lowestLocation = findLowestLocation(seedNums, transformMaps);

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

  const { seedNums, transformMaps } = parseLines(lines, true);
  const lowestLocation = findLowestLocation(seedNums, transformMaps);

  logAnswer(2, taskStarted, lowestLocation, USE_TEST_DATA ? 46 : undefined);
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
