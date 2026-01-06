export async function fromAsync<T>(
  asyncIterable: AsyncIterable<T>
): Promise<T[]> {
  const results: T[] = [];

  for await (const item of asyncIterable) {
    results.push(item);
  }

  return results;
}
