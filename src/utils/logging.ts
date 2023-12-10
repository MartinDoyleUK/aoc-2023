/* eslint-disable import/no-named-as-default-member */
import chalk from 'chalk';
import _ from 'lodash';
import numberToWords from 'number-to-words';

import { NUMBER_FORMATTER, timeSinceStarted } from './formatters';

type LogAnswerFn = (args: {
  answer: unknown;
  expected?: unknown;
  partNum: PartNumber;
  taskStartedAt: number;
}) => void;

type PartNumber = 1 | 2;

export const logPuzzleDay = (day: string, isFirst = true) => {
  const dayWords = numberToWords.toWordsOrdinal(day);

  if (!isFirst) {
    console.info('');
  }
  console.info(
    chalk.bold.green(`
Running ${dayWords} day of Advent of Code ...`),
  );
};

export const logAnswer: LogAnswerFn = ({
  partNum,
  taskStartedAt,
  answer,
  expected: expectedParam,
}) => {
  const timeTaken = timeSinceStarted(taskStartedAt);
  const partText = `${_.capitalize(
    numberToWords.toWordsOrdinal(partNum),
  )} part took ${timeTaken}`;
  let answerText: string;
  if (typeof answer === 'number') {
    const formatted = NUMBER_FORMATTER.format(answer);
    const raw = `${answer}`;
    answerText = `Answer is ${formatted}`;
    if (formatted !== raw) {
      answerText += ` (${raw})`;
    }
  } else {
    answerText = `Answer is ${answer}`;
  }

  if (expectedParam !== undefined) {
    let isExpected = answer === expectedParam;
    if (typeof expectedParam === 'function') {
      isExpected = expectedParam(answer) === true;
    }

    let expectedDisplayValue = expectedParam;
    if (typeof expectedParam === 'function') {
      expectedDisplayValue = 'verify-function result';
    }

    const colourFn = isExpected ? chalk.reset.green : chalk.reset.red;
    answerText += colourFn(
      isExpected
        ? ' ✅'
        : ` ❌ (should equal ${JSON.stringify(expectedDisplayValue)})`,
    );
  }

  const messageParts = [
    chalk.bold.cyan(partText),
    '➡️ ',
    chalk.bold.yellow(answerText),
  ];
  console.info(messageParts.join(' '));
};

export const logTime = (before: number, dayString: string) => {
  const timeTaken = timeSinceStarted(before);
  console.info(
    chalk.green(
      `Took ${timeTaken} to run all tasks for day ${numberToWords.toWords(
        dayString,
      )}`,
    ),
  );
};

export const logComplete = (before: number) => {
  const timeTaken = timeSinceStarted(before);
  const completedMessage = ` All completed in ${timeTaken}`;
  const message = `
=== ${completedMessage} ===
`;
  console.info(message);
};

export const logStart = () => {
  console.info(`
=== Starting puzzle run ===`);
};

export const logError = (label: string, error: Error) => {
  console.info(chalk.bold.red(label), error);
};

export const logInfo = (...args: any[]) => {
  console.info(...args);
};
