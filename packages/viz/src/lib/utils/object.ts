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
      // eslint-disable-next-line no-param-reassign
      convertedObject[currentArrayElement] = values[currentArrayIndex];
      return convertedObject;
    },
    {}
  );
}
