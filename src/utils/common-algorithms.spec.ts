import { findTransitionByIndex, getBinaryCandidate } from './common-algorithms';

describe('getBinaryCandidate()', () => {
  const testCases = [
    ['should find the mid-point of an odd-numbered range', 4, 6, 5],
    ['should go down to find the mid-point of an even-numbered range', 4, 7, 5],
    ['should return the start of range of length two', 4, 5, 4],
    ['should return the start of range of length one', 4, 4, 4],
  ];

  it.each(testCases)('%s', (_, start, end, expected) => {
    const actual = getBinaryCandidate(start as number, end as number);
    expect(actual).toBe(expected as number);
  });

  const errorTestCases = [
    ['should error if start is above end', 10, 5],
    ['should error if start is undefined', undefined, 5],
    ['should error if end is undefined', 10, undefined],
    ['should error if start and end are undefined', undefined, undefined],
  ];

  it.each(errorTestCases)('%s', (_, start, end) => {
    expect(() => getBinaryCandidate(start as number, end as number)).toThrow();
  });
});

describe('findTransitionByIndex()', () => {
  const testCases = [
    ['should find the transition point in an odd range', 1, 3, 2],
    ['should find the transition point in an even range', 1, 4, 3],
    [
      'should find the transition point where the candidate jumps the transition point',
      1,
      100,
      74,
    ],
  ];

  it.each(testCases)('%s', (_, lower, upper, expected) => {
    const predicate = (input: number) => input >= (expected as number);
    const actual = findTransitionByIndex({
      lower: lower as number,
      predicate,
      upper: upper as number,
    });
    expect(actual).toBe(expected as number);
  });

  it('should return undefined if there is no transition', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const predicate = () => false;
    const actual = findTransitionByIndex({ lower: 1, predicate, upper: 10 });
    expect(actual).toBeUndefined();
  });
});
