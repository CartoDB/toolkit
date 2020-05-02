import { Credentials, defaultCredentials } from '@carto/toolkit-core';

import { Source, LayerProps, FieldStats } from './Source';

interface Variable {
  id: string;
  agg_method: string;
  column_name: string;
  dataset_id: string;
  db_type: string;
  description: string;
  name: string;
  slug: string;
  starred: boolean;
  summary_json: {
    head: number[] | string[];
    tail: number[] | string[];
    histogram: [
      {
        avg: number;
        count: number;
        max_range: number;
        min_range: number;
      }
    ];
    quantiles: {
      interquartile_range: number;
      median: number;
      q1: number;
      q3: number;
    };
    stats: {
      min: number;
      max: number;
      avg: number;
      sum: number;
      stdev: number;
      range: number;
    };
  };
  variable_group_id: string;
}

interface Dataset {
  id: string;
  available_in: string[];
  category_id: string;
  category_name: string;
  country_id: string;
  country_name: string;
  data_source_id: string;
  data_source_name: string;
  description: string;
  geography_description: string;
  geography_id: string;
  geography_name: string;
  is_public_data: true;
  lang: string;
  name: string;
  provider_id: string;
  provider_name: string;
  slug: string;
  summary_json: any;
  time_coverage: string;
  version: string;
}

interface Model {
  dataset: Dataset;
  variable: Variable;
}

interface DOLayerProps extends LayerProps {
  // Tile URL Template for geographies. It should be in the format of https://server/{z}/{x}/{y}..
  geographiesURLTemplate: string | Array<string>;
  // Tile URL Template for data. It should be in the format of https://server/{z}/{x}/{y}..
  dataURLTemplate: string | Array<string>;
}

export class DOSource extends Source {
  // CARTO's credentials of the user
  private _credentials: Credentials;

  // BASE URL
  private _baseURL: string;

  private _model: Promise<Model>;

  private _variable: string;

  constructor(variable: string, credentials?: Credentials) {
    const id = `DO-${variable}`;
    super(id);

    this._credentials = credentials || defaultCredentials;

    this._variable = variable;

    this._baseURL = `${this._credentials.serverURL}api/v4/data/observatory`;
    this._model = this._init(variable);
  }

  private async _init(variableID: string): Promise<Model> {
    const variable = await this._getVariable(variableID);
    const dataset = await this._getDataset(variable.dataset_id);
    return { variable, dataset };
  }

  private async _getVariable(variableID: string): Promise<Variable> {
    const url = `${this._baseURL}/metadata/variables/${variableID}`;
    const r = await fetch(url);
    return parseFetchJSON(r);
  }

  private async _getDataset(datasetID: string): Promise<Dataset> {
    const url = `${this._baseURL}/metadata/datasets/${datasetID}`;
    const r = await fetch(url);
    return parseFetchJSON(r);
  }

  public async getLayerProps(): Promise<DOLayerProps> {
    const vizURL = `${this._baseURL}/visualization`;
    const { apiKey } = this._credentials;

    // Get geography from metadata
    const model = await this._model;
    const geography = model.dataset.geography_id;

    const geographiesURLTemplate = `${vizURL}/geographies/${geography}/{z}/{x}/{y}.mvt?api_key=${apiKey}`;
    const dataURLTemplate = `${vizURL}/variables/{z}/{x}/{y}.json?variable=${this._variable}&api_key=${apiKey}`;
    const geometryType = 'MultiPolygon';

    return { geographiesURLTemplate, dataURLTemplate, geometryType };
  }

  public async getFieldStats(field: string): Promise<FieldStats> {
    const model = await this._model;

    if ([model.variable.id, model.variable.slug].indexOf(field) === -1) {
      throw new Error('Stats are only available for variable id or slug');
    }

    return { name: field, ...model.variable.summary_json.stats };
  }
}

function parseFetchJSON(r: Response) {
  switch (r.status) {
    case 200:
      return r.json();
    case 404:
      throw new Error('Not found');
    default:
      throw Error('Unexpected error fetching the variable');
  }
}
