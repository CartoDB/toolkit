import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapInstance, MapOptions, Maps } from '@carto/toolkit-maps';
import { sourceOptions, Source, blueprint} from './Source'

const defaultMapOptions: MapOptions = {
  vector_extent: 2048,
  vector_simplify_extent: 2048,
  metadata: {
    geometryType: true
  }
};

/**  
 * Implementation of a Source compatible with CARTO's MAPs API
 * **/
export class CARTOSource extends Source{

    // type of the source. 
    private _type: 'sql' | 'dataset';
    // value it should be a dataset name or a SQL query
    private _value: string;
    // Map config for MAPs API
    private _mapOptions: MapOptions;
    // Instantiation object 
    private _mapInstantiation: Promise<MapInstance>;
    // Maps client object. It's a reference to the main object of '@carto/toolkit-maps'
    private _mapsClient: Maps;
    // Internal credentials of the user
    private _credentials: Credentials;

    constructor(source: string, options: sourceOptions = {}) {

      const { mapOptions = {}, credentials = defaultCredentials } = options;
      
      // set layer id
      const id = `CARTOSource-${source}`;

      // call to super class
      super(id);

      // Set object properties
      this._type = this._getType(source);
      this._value = source;
      this._credentials = credentials;
      
      // MAPS API instantiation
      this._mapsClient = new Maps(this._credentials);
      this._mapOptions = Object.assign({}, defaultMapOptions, mapOptions, this._getSourceOptions());
      this._mapInstantiation = this._mapsClient.instantiateMapFrom(this._mapOptions);

    }


    /**
     * Parse a string to guess the type of the source
     * @param source string to guess the type
     */
    private _getType(source: string) {
      const containsSpace = source.search(' ') > -1;
      return containsSpace ? 'sql' : 'dataset';
    }
  
    private _getSourceOptions() {
      return { [this._type]: this._value };
    }

    /**
    * This methods returns the blueprint of the TileLayer. 
    * It returns the blueprint of the source:
    *   - URL of the tiles provided by MAPs API
    *   - geometryType
    */
    public async blueprint(): Promise<blueprint> {
      return await this._mapInstantiation.then(this._parseInstantiationResult);
    }

    private _parseInstantiationResult(instantiationData: any): blueprint {
      const metadata = instantiationData.metadata;
  
      const urlData = metadata.url.vector;
      const tileURL = urlData.subdomains.map(
        (subdomain: string) => urlData.urlTemplate.replace('{s}', subdomain)
      );
  
      const geometryType = metadata.layers[0].meta.stats.geometryType.split('ST_')[1];
        
      return { tileURL, geometryType };
      }

}
