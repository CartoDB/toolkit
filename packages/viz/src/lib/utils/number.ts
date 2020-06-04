export function castToNumberOrUndefined(number: string | number) {
  const castedNumber = Number(number);

  if (!Number.isFinite(castedNumber)) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return castedNumber;
}
