// TODO: See how to properly assign type to values
export const convertArrayToObjectWithValues = (arrayToConvert: string[], values: any[]) => {
  return arrayToConvert.reduce(
    (convertedObject: Record<string, any>, currentArrayElement, currentArrayIndex) => {
      convertedObject[currentArrayElement] = values[currentArrayIndex];
      return convertedObject;
    }, {}
  );
};
