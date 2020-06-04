import { CartoError, WithEvents } from '@carto/toolkit-core';
import { Layer, CARTOSource } from '@carto/toolkit-viz';

export class DataView extends WithEvents {
  private dataSource: CARTOSource | Layer;
  protected column: string;

  constructor(dataSource: CARTOSource | Layer, column: string) {
    super();
    validateParameters(dataSource, column);

    this.dataSource = dataSource;
    this.column = column;

    this.bindEvents();
  }

  private bindEvents() {
    this.registerAvailableEvents(['dataUpdate']);

    if (this.dataSource instanceof Layer) {
      this.dataSource.on('viewportLoad', () => {
        this.onDataUpdate();
      });
    }
  }

  private onDataUpdate() {
    this.emitter.emit('dataUpdate');
  }

  protected getSourceData(columns: string[]) {
    return (this.dataSource as Layer).getViewportFeatures(columns);
  }
}

function validateParameters(source: CARTOSource | Layer, column: string) {
  if (!source) {
    throw new CartoError({
      type: '[DataView]',
      message: 'Source was not provided while creating dataview'
    });
  }

  if (!column) {
    throw new CartoError({
      type: '[DataView]',
      message: 'Column name was not provided while creating dataview'
    });
  }
}
