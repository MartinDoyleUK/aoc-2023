export const findGreatestCommonDenominator = (
  firstNum: number,
  secondNum: number,
): number => {
  if (secondNum === 0) {
    return firstNum;
  }

  return findGreatestCommonDenominator(secondNum, firstNum % secondNum);
};

export const getLowestCommonMultipleOfTwoNumbers = (
  firstNum: number,
  secondNum: number,
) =>
  (firstNum / findGreatestCommonDenominator(firstNum, secondNum)) * secondNum;

export const getLowestCommonMultiple = (inputNums: number[]) =>
  // eslint-disable-next-line unicorn/no-array-reduce
  inputNums.reduce(getLowestCommonMultipleOfTwoNumbers, 1);
