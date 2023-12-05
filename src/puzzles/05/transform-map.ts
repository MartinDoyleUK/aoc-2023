export class TransformMap {
  private sourceName: string;

  private destName: string;

  private ranges: { max: number; min: number; offset: number }[] = [];

  public constructor(sourceName: string, destName: string) {
    this.sourceName = sourceName;
    this.destName = destName;
  }

  public getName() {
    return `${this.sourceName} to ${this.destName}`;
  }

  public addRange(destStart: number, sourceStart: number, rangeLength: number) {
    this.ranges.push({
      max: sourceStart + rangeLength - 1,
      min: sourceStart,
      offset: destStart - sourceStart,
    });
  }

  public mapVal(input: number) {
    let result: number | undefined;
    for (const { min, max, offset } of this.ranges) {
      if (input >= min && input <= max) {
        result = input + offset;
      }
      if (result !== undefined) {
        break;
      }
    }

    return result ?? input;
  }

  public toJSON() {
    return this.ranges;
  }
}
