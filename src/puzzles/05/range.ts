/* eslint-disable canonical/id-match */
export class Range {
  private _lower: number;

  private _length: number;

  public constructor(lower: number, length: number) {
    this._lower = lower;
    this._length = length;
  }

  public get lower() {
    return this._lower;
  }

  public get upper() {
    return this._lower + this._length - 1;
  }

  public get length() {
    return this._length;
  }

  public setNewUpper(newUpper: number) {
    this._length += newUpper - this.upper;
  }

  public toJSON() {
    return [this._lower, this._length];
  }
}

/**
 * Merge contiguous ranges and de-duplicate.
 * @param input A collection of ranges
 * @returns The consolidated ranges
 */
export const consolidateRanges = (input: Range[]): Range[] => {
  const sortedRanges = input.slice().sort((a, b) => a.lower - b.lower);
  const consolidatedRanges: Range[] = [];

  let workingRange: Range | undefined;
  for (const nextRange of sortedRanges) {
    if (workingRange) {
      if (
        nextRange.lower <= workingRange.upper ||
        nextRange.lower === workingRange.upper + 1
      ) {
        workingRange.setNewUpper(nextRange.upper);
      } else {
        consolidatedRanges.push(workingRange);
        workingRange = nextRange;
      }
    } else {
      workingRange = nextRange;
    }
  }
  if (workingRange) {
    consolidatedRanges.push(workingRange);
  }

  return consolidatedRanges;
};
