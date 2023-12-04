import { formatDuration, intervalToDuration } from 'date-fns';

export const NUMBER_FORMATTER = new Intl.NumberFormat('en-GB');

export const ROUNDED_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
});

export const MILLISECOND_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 2,
  unit: 'millisecond',
});

export const timeSinceStarted = (timeStarted: number) => {
  const now = performance.now();

  // If less than 10 seconds then display in milliseconds
  if (now - timeStarted < 1_000 * 10) {
    return ROUNDED_NUMBER_FORMATTER.format(now - timeStarted) + 'ms';
  }

  const startDate = new Date(timeStarted);
  const endDate = new Date(now);
  const duration = intervalToDuration({ end: endDate, start: startDate });

  return formatDuration(duration);
};
