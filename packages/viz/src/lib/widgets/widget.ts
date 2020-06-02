import { CategoryDataView } from '@carto/toolkit-data';
import { CartoError } from '@carto/toolkit-core';

export class Widget {
  protected element: HTMLElement;
  protected dataView: CategoryDataView;

  constructor(element: string | HTMLElement, dataView: CategoryDataView) {
    const domElement = queryDOMElement(element);
    validateParameters(domElement, dataView);

    this.element = domElement as HTMLElement;
    this.dataView = dataView;
  }

  protected bindEvents() {
    this.dataView.on('dataUpdate', () => this.updateData());
  }

  // eslint-disable-next-line class-methods-use-this
  protected updateData() {
    throw new CartoError({
      type: '[Widget]',
      message: 'Update data method is not implemented in this widget'
    });
  }
}

function validateParameters(
  element: HTMLElement | null,
  dataView: CategoryDataView
) {
  if (!element) {
    throw new CartoError({
      type: '[Widget]',
      message: 'Element passed to Category Widget is not valid'
    });
  }

  if (!(dataView instanceof CategoryDataView)) {
    throw new CartoError({
      type: '[Widget]',
      message: 'DataView passed to Category Widget is not valid'
    });
  }
}

// TODO: Move to utils
function queryDOMElement(elementOrSelector: string | HTMLElement) {
  if (elementOrSelector instanceof HTMLElement) {
    return elementOrSelector;
  }

  return document.querySelector<HTMLElement>(elementOrSelector);
}
