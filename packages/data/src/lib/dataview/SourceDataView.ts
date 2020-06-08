import { MapsDataviews as DataviewsApi } from '@carto/toolkit-maps';
import { Layer, CARTOSource } from '@carto/toolkit-viz';
import { defaultCredentials, WithEvents } from '@carto/toolkit-core';
import { CartoDataViewError, dataViewErrorTypes } from './DataViewError';

export abstract class SourceDataView extends WithEvents {
  private _source: CARTOSource | Layer;
  private _column: string;
  protected dataviewsApi: DataviewsApi;

  constructor(
    source: CARTOSource | Layer,
    column: string,
    credentials = defaultCredentials
  ) {
    super();
    validateParameters(source, column);

    this._source = source;
    this._column = column;
    this.dataviewsApi = new DataviewsApi(this._getSourceName(), credentials);

    this.registerAvailableEvents(['dataChanged', 'optionChanged']);
  }

  public set source(newSource: CARTOSource | Layer) {
    validateParameters(newSource, this._column);

    this._source = newSource;
    this.emit('optionChanged');
  }

  public get column() {
    return this._column;
  }

  public set column(newColumn: string) {
    validateParameters(this._source, newColumn);

    this._column = newColumn;
    this.emit('optionChanged');
  }

  private _getSourceName() {
    let source;

    if (this._source instanceof CARTOSource) {
      source = this._source as CARTOSource;
    } else {
      source = (this._source as Layer).source as CARTOSource;
    }

    return source.value;
  }
}

function validateParameters(source: CARTOSource | Layer, column: string) {
  if (!source) {
    throw new CartoDataViewError(
      'Source was not provided while creating dataview',
      dataViewErrorTypes.PROPERTY_MISSING
    );
  } else if (source instanceof Layer) {
    const layerSource = (source as Layer).source;

    if (!(layerSource instanceof CARTOSource)) {
      throw new CartoDataViewError(
        'The provided source has to be an instance of Layer or CARTOSource',
        dataViewErrorTypes.PROPERTY_INVALID
      );
    }
  }

  if (!column) {
    throw new CartoDataViewError(
      'Column name was not provided while creating dataview',
      dataViewErrorTypes.PROPERTY_MISSING
    );
  }
}
