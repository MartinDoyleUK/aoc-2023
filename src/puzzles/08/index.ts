/* eslint-disable id-length */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { logAnswer, getLowestCommonMultiple } from '../../utils';

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
const REGEX_FORK_DEF = /^(.{3}) = \((.{3}), (.{3})\)$/u;

// Run task one
const runOne = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST1 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const [stepsPattern, ...forkDefs] = lines as [string, ...string[]];
  const nodesMap = new Map<string, [string, string]>();
  for (const nextForkDef of forkDefs) {
    const [, node, left, right] = REGEX_FORK_DEF.exec(
      nextForkDef,
    ) as unknown as [unknown, string, string, string];
    nodesMap.set(node, [left, right]);
  }

  let stepCounter = 0;
  let nextNode = 'AAA';
  for (let patternIdx = 0; patternIdx < stepsPattern.length; patternIdx++) {
    stepCounter++;
    const nextStep = stepsPattern[patternIdx] as 'L' | 'R';
    nextNode = nodesMap.get(nextNode)![nextStep === 'L' ? 0 : 1];
    if (nextNode === 'ZZZ') {
      break;
    }

    if (patternIdx === stepsPattern.length - 1) {
      patternIdx = -1;
    }
  }

  logAnswer({
    answer: stepCounter,
    expected: USE_TEST_DATA ? 6 : 19_241,
    partNum: 1,
    taskStartedAt,
  });
};

// Run task two
const runTwo = () => {
  const taskStartedAt = performance.now();
  const dataToUse = USE_TEST_DATA ? DATA.TEST2 : DATA.REAL;
  const lines = dataToUse.split('\n').filter((line) => line.trim().length > 0);

  const [stepsPattern, ...forkDefs] = lines as [string, ...string[]];
  const startingNodes: string[] = [];
  const endingNodes: string[] = [];
  const nodesMap = new Map<string, [string, string]>();
  for (const nextForkDef of forkDefs) {
    const [, node, left, right] = REGEX_FORK_DEF.exec(
      nextForkDef,
    ) as unknown as [unknown, string, string, string];
    if (node.endsWith('A')) {
      startingNodes.push(node);
    } else if (node.endsWith('Z')) {
      endingNodes.push(node);
    }
    nodesMap.set(node, [left, right]);
  }

  const getNextStep = (step: number) => {
    const patternIdx = step % stepsPattern.length;
    return stepsPattern[patternIdx] as 'L' | 'R';
  };

  const endingSteps: number[] = startingNodes.map<number>(
    (nextStartingNode) => {
      let endStep: number | undefined;
      let stepCounter = 0;
      let nextNode = nextStartingNode;
      while (endStep === undefined) {
        if (endingNodes.includes(nextNode)) {
          endStep = stepCounter;
          break;
        }

        const nextSteps = nodesMap.get(nextNode)!;
        const nextDir = getNextStep(stepCounter);
        nextNode = nextSteps[nextDir === 'L' ? 0 : 1];
        stepCounter++;
      }

      return endStep;
    },
  );

  const numSteps = getLowestCommonMultiple(endingSteps);

  logAnswer({
    answer: numSteps,
    expected: USE_TEST_DATA ? 6 : 9_606_140_307_013,
    partNum: 2,
    taskStartedAt,
  });
};

// Export a function to run both tasks
export const runTasks = () => {
  runOne();
  runTwo();
};
