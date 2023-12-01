import chalk from 'chalk';

import { NUMBER_FORMATTER, MILLISECOND_FORMATTER } from './formatters';

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

export const logAnswer = (
  part: PartNumber,
  answer: unknown,
  expected?: unknown,
) => {
  const partText = `Part ${part}`;
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

  if (expected !== undefined) {
    const isExpected = answer === expected;
    const colourFn = isExpected ? chalk.green : chalk.red;
    answerText += colourFn(
      isExpected
        ? ' (matches expected value)'
        : ` (does not match expected value of ${JSON.stringify(expected)})`,
    );
  }

  const messageParts = [
    chalk.bold.cyan(partText),
    '➡️ ',
    chalk.bold.yellow(answerText),
  ];
  console.info(messageParts.join(' '));
};

export const logTime = (before: number) => {
  const timeTaken = MILLISECOND_FORMATTER.format(performance.now() - before);
  console.info(chalk.green(`Runtime: ${timeTaken}ms`));
};

export const logComplete = (before: number) => {
  const timeTaken = MILLISECOND_FORMATTER.format(performance.now() - before);
  const completedMessage = ` Completed in ${timeTaken}ms`;
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
