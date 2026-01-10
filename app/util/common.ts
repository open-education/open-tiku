export function arrayToDict<T, K extends keyof T>(
  array: T[],
  key: K
): Record<T[K] extends PropertyKey ? T[K] : never, T> {
  return array.reduce((acc, item) => {
    acc[item[key] as any] = item;
    return acc;
  }, {} as any);
}
