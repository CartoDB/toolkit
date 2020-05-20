export function groupValuesByAnotherColumn<T>(
  data: Record<string, T>[],
  valuesColumn: string,
  keysColumn: string
) {
  return data.reduce(
    (accumulator: Record<string, T[]>, item: Record<string, string | T>) => {
      const group = item[keysColumn] as string;

      accumulator[group] = accumulator[group] || [];
      accumulator[group].push(item[valuesColumn] as T);

      return accumulator;
    },
    {}
  );
}
