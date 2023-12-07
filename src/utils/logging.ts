import chalk from 'chalk';

import { NUMBER_FORMATTER, timeSinceStarted } from './formatters';

type PartNumber = 1 | 2;

export const logPuzzleDay = (day: string, isFirst = true) => {
  if (!isFirst) {
    console.info('');
  }
  console.info(
    chalk.bold.green(`
Day ${day}`),
  );
};

export const logAnswer = (part: PartNumber, taskStarted: number, answer: unknown, expectedParam?: unknown) => {
  const timeTaken = timeSinceStarted(taskStarted);
  const partText = `Part ${part} took ${timeTaken}`;
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

    const colourFn = isExpected ? chalk.green : chalk.red;
    answerText += colourFn(
      isExpected
        ? ' (matches expected value)'
        : ` (does not match expected value of ${JSON.stringify(expectedDisplayValue)})`,
    );
  }

  const messageParts = [chalk.bold.cyan(partText), '➡️ ', chalk.bold.yellow(answerText)];
  console.info(messageParts.join(' '));
};

export const logTime = (before: number) => {
  const timeTaken = timeSinceStarted(before);
  console.info(chalk.green(`Took ${timeTaken} to run all tasks for day`));
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
