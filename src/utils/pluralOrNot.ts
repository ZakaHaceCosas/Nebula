export function pluralOrNot(word: string, numToCheck: number) {
  if (numToCheck != 1) return `${word}s`;
  return word;
}
