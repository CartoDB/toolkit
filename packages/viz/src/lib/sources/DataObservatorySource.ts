/* eslint-disable @typescript-eslint/no-explicit-any */
import { Credentials, defaultCredentials } from '@carto/toolkit-core';

import { Source, LayerProps } from './Source';

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
  summary_json: any;
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

interface DataObservatoryLayerProps extends LayerProps {
  // Tile URL Template for geographies. It should be in the format of https://server/{z}/{x}/{y}..
  geographiesURLTemplate: string | Array<string>;
  // Tile URL Template for data. It should be in the format of https://server/{z}/{x}/{y}..
  dataURLTemplate: string | Array<string>;
}

export class DataObservatorySource extends Source {
  // CARTO's credentials of the user
  private _credentials: Credentials;

  // DO variable id
  private _variable: string;

  // BASE URL
  private _baseURL: string;

  constructor(variable: string, credentials?: Credentials) {
    const id = `DataObservatory-${variable}`;
    super(id);

    this._credentials = credentials || defaultCredentials;
    this._variable = variable;
    this._baseURL = `${this._credentials.serverURL}api/v4/data/observatory`;
  }

  private async _getVariable(): Promise<Variable> {
    const url = `${this._baseURL}/metadata/variables/${this._variable}`;
    const r = await fetch(url);
    return parseFecthJSON(r);
  }

  private async _getDataset(datasetID: string): Promise<Dataset> {
    const url = `${this._baseURL}/metadata/datasets/${datasetID}`;
    const r = await fetch(url);
    return parseFecthJSON(r);
  }

  public async getLayerProps(): Promise<DataObservatoryLayerProps> {
    const vizURL = `${this._baseURL}/visualization`;
    const { apiKey } = this._credentials;

    // Get geography from metadata
    const variable = await this._getVariable();
    const dataset = await this._getDataset(variable.dataset_id);

    const geography = dataset.geography_id;

    const geographiesURLTemplate = `${vizURL}/geographies/${geography}/{z}/{x}/{y}.mvt?api_key=${apiKey}`;
    const dataURLTemplate = `${vizURL}/variables/{z}/{x}/{y}.json?variable=${this._variable}&api_key=${apiKey}`;
    const geometryType = 'MultiPolygon';

    return { geographiesURLTemplate, dataURLTemplate, geometryType };
  }
}

function parseFecthJSON(r: Response) {
  switch (r.status) {
    case 200:
      return r.json();
    case 404:
      throw new Error('Not found');
    default:
      throw Error('Unexpected error fetching the variable');
  }
}
