/* eslint-disable id-length */
export const reverseString = (input: string): string => {
  let reversed = '';
  for (let i = input.length - 1; i >= 0; i--) {
    reversed += input.charAt(i);
  }
  return reversed;
};
