export function convertArrayToObjectWithValues<T>(
  arrayToConvert: string[],
  values: T[]
) {
  return arrayToConvert.reduce(
    (
      accumulator: Record<string, T>,
      currentArrayElement,
      currentArrayIndex
    ) => {
      accumulator[currentArrayElement] = values[currentArrayIndex];
      return accumulator;
    },
    {}
  );
}

export function selectPropertiesFrom<T>(
  objectInstance: Record<string, T>,
  properties: string[]
): Record<string, T> {
  if (!properties.length) {
    return objectInstance;
  }

  return properties.reduce((accumulator: Record<string, T>, property) => {
    accumulator[property] = objectInstance[property];
    return accumulator;
  }, {});
}
