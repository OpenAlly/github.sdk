export function createApiProxy<T>(
  factory: (key: string) => T
): Record<string, T> {
  return new Proxy(Object.create(null), {
    get(_, key: string) {
      return factory(key);
    }
  }) as Record<string, T>;
}
