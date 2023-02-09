/**
 * Creates an infinite array from the provided array.
 *
 * Accessing an index that would usually be out of bounds
 * will instead wrap around to the beginning.
 *
 * @param list The list that should get cycled
 */
export default function <TValue>(list: TValue[]): TValue[] {
  return new Proxy(list, {
    get(target, key: unknown) {
      return target[(key as number) % list.length];
    },
  });
}
