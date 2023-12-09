/* eslint-disable id-length */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer } from '../../utils';

import { Range, consolidateRanges } from './range';
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

const parseLines = (lines: string[], seedNumsAreRange = false) => {
  const seedRanges: Range[] = [];
  const transformMaps: TransformMap[] = [];
  let nextTransformMap: TransformMap | undefined;
  for (const nextLine of lines) {
    let match: RegExpExecArray | null;
    if ((match = REGEX.Seeds.exec(nextLine))) {
      const [, seedNums] = match;
      const mappedSeedNums = seedNums!
        .split(' ')
        .map((nextSeed) => Number.parseInt(nextSeed, 10));
      if (seedNumsAreRange) {
        while (mappedSeedNums.length > 0) {
          const start = mappedSeedNums.shift()!;
          const length = mappedSeedNums.shift()!;
          seedRanges.push(new Range(start, length));
        }
      } else {
        seedRanges.push(
          ...mappedSeedNums.map((nextSeed) => new Range(nextSeed, 1)),
        );
      }
    } else if ((match = REGEX.MapTitle.exec(nextLine))) {
      const [, source, dest] = match;
      if (nextTransformMap !== undefined) {
        transformMaps.push(nextTransformMap);
      }
      nextTransformMap = new TransformMap(source!, dest!);
    } else if ((match = REGEX.MappingInfo.exec(nextLine))) {
      const [, destStart, sourceStart, rangeLength] = match.map((nextVal) =>
        Number.parseInt(nextVal!, 10),
      ) as [unknown, number, number, number];
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

const findLowestLocation = (
  seedRanges: Range[],
  transformMaps: TransformMap[],
) => {
  let nextRangesToMap: Range[] = seedRanges
    .slice()
    .sort((a, b) => a.lower - b.lower);
  let mappedRanges: Range[] = [];

  for (const nextMap of transformMaps) {
    mappedRanges = [];
    let nextRange: Range | undefined;
    while ((nextRange = nextRangesToMap.shift())) {
      const nextMappedRanges = nextMap.mapRange(nextRange);
      mappedRanges.push(...nextMappedRanges);
    }
    nextRangesToMap = consolidateRanges(mappedRanges);
  }

  let lowestLocation = Number.MAX_SAFE_INTEGER;
  for (const { lower } of nextRangesToMap) {
    if (lower < lowestLocation) {
      lowestLocation = lower;
    }
  }

  return lowestLocation;
};

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse
    .split('\n')
    .map((line) => line.toLowerCase().trim())
    .filter((line) => line.length > 0);

  const { seedRanges, transformMaps } = parseLines(lines);
  const lowestLocation = findLowestLocation(seedRanges, transformMaps);

  logAnswer({
    answer: lowestLocation,
    expected: USE_TEST_DATA ? 35 : 650_599_855,
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
    .map((line) => line.toLowerCase().trim())
    .filter((line) => line.length > 0);

  const { seedRanges, transformMaps } = parseLines(lines, true);
  const lowestLocation = findLowestLocation(seedRanges, transformMaps);

  logAnswer({
    answer: lowestLocation,
    expected: USE_TEST_DATA ? 46 : 1_240_035,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
