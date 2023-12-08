import { Range } from './range';

interface MappingRange {
  max: number;
  min: number;
  offset: number;
}

export class TransformMap {
  private sourceName: string;

  private destName: string;

  private sortedRanges: MappingRange[] = [];

  public constructor(sourceName: string, destName: string) {
    this.sourceName = sourceName;
    this.destName = destName;
  }

  public getName() {
    return `${this.sourceName} to ${this.destName}`;
  }

  public addRange(destStart: number, sourceStart: number, rangeLength: number) {
    this.sortedRanges.push({
      max: sourceStart + rangeLength - 1,
      min: sourceStart,
      offset: destStart - sourceStart,
    });
    this.sortedRanges.sort((a, b) => a.min - b.min);
  }

  public mapVal(input: number) {
    let result: number | undefined;
    for (const { min, max, offset } of this.sortedRanges) {
      if (input >= min && input <= max) {
        result = input + offset;
      }
      if (result !== undefined) {
        break;
      }
    }

    return result ?? input;
  }

  // NOTE: Need to assume no overlapping ranges
  public mapRange(input: Range) {
    // Create a movable version of the original range
    let inputRangeStart: number;
    let inputRangeEnd: number;
    let inputRangeLength: number;
    /* eslint-disable prefer-const */
    ({
      lower: inputRangeStart,
      upper: inputRangeEnd,
      length: inputRangeLength,
    } = input);
    /* eslint-enable prefer-const */

    // Setup output and create queue of ranges to run through
    const mappedRanges: Range[] = [];
    const sortedRangesQueue = this.sortedRanges.slice();

    // For each range, create output ranges and update start and end of input range
    let nextRangeMap: MappingRange | undefined;
    let lastUsedMap: MappingRange | undefined;
    while ((nextRangeMap = sortedRangesQueue.shift())) {
      const { min, max, offset } = nextRangeMap;
      lastUsedMap = nextRangeMap;

      if (inputRangeEnd < min) {
        mappedRanges.push(input);
        continue;
      }

      if (inputRangeStart > max) {
        continue;
      }

      if (inputRangeStart >= min && inputRangeEnd <= max) {
        const newStart = inputRangeStart + offset;
        mappedRanges.push(new Range(newStart, inputRangeLength));
        break;
      }

      if (inputRangeStart < min) {
        mappedRanges.push(new Range(inputRangeStart, min - inputRangeStart));
        inputRangeStart = min;
        continue;
      }

      if (inputRangeEnd > max) {
        mappedRanges.push(
          new Range(inputRangeStart + offset, max + 1 - inputRangeStart),
        );
        inputRangeStart = max + 1;
        continue;
      }
    }

    // Account for range provided being beyond all specified mapping ranges
    if (inputRangeStart > lastUsedMap!.max) {
      mappedRanges.push(input);
    }

    return mappedRanges;
  }

  public toJSON() {
    return this.sortedRanges;
  }
}
