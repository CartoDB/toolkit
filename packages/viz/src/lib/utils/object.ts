export function convertArrayToObjectWithValues<T>(
  arrayToConvert: string[],
  values: T[]
) {
  return arrayToConvert.reduce(
    (
      convertedObject: Record<string, T>,
      currentArrayElement,
      currentArrayIndex
    ) => {
      convertedObject[currentArrayElement] = values[currentArrayIndex];
      return convertedObject;
    },
    {}
  );
}
