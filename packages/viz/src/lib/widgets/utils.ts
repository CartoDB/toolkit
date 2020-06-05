export function queryDOMElement(elementOrSelector: string | HTMLElement) {
  if (elementOrSelector instanceof HTMLElement) {
    return elementOrSelector;
  }

  return document.querySelector<HTMLElement>(elementOrSelector);
}
