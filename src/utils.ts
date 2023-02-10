/**
 * Returns a cycled entry from the list. If the provided index is
 * out of bounds of the list, it will instead wrap around to the
 * beginning.
 *
 * Throws an error if the provided list is empty.
 *
 * @param list - The list to search in
 * @param index - The index of the item
 */
export function getFromCycled<T>(list: T[], index: number): T {
  if (list.length === 0) {
    throw new Error("Trying to get cycled entry from empty list");
  }
  return list[index % (list.length - 1)];
}

/**
 * Wraps a value into an array if it isn't already.
 *
 * @param value - The value to wrap
 */
export function wrapArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}
