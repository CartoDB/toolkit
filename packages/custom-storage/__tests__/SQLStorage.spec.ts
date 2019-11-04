import { SQL } from '@carto/toolkit-sql';
import { SQLStorage } from '../src/sql/SQLStorage';
import {
  StoredVisualization,
  // Visualization,
  // Dataset
} from '../src/StorageRepository';

const STORED_VIS: StoredVisualization = {
  id: 'a1b2c3d4',
  name: 'myVis',
  description: 'This is a test vis',
  thumbnail: '',
  config: '{}',
  lastModified: '2019-11-02T14:00:00Z',
  isPrivate: false
};

describe('SQLStorage', () => {
  let sqlStorage: SQLStorage;

  beforeAll(() => {
    const sqlClient = new SQL('user', 'm14p1k3y', 'https://{user}.carto.com/');
    sqlStorage = new SQLStorage('mynamespace', sqlClient, 1, true);
  });

  it('should check or create tables for storage on init', async () => {
    const expectedQueries = [
      'CREATE TABLE IF NOT EXISTS mynamespace_public_v1 (id uuid PRIMARY KEY DEFAULT mynamespace_create_uuid(), name text NOT NULL, description text, thumbnail text, private boolean, config json, last_modified timestamp NOT NULL DEFAULT now());',
      'CREATE TABLE IF NOT EXISTS mynamespace_public_v1_datasets (id uuid PRIMARY KEY DEFAULT mynamespace_create_uuid(), tablename text UNIQUE NOT NULL, name text UNIQUE NOT NULL);',
      'CREATE TABLE IF NOT EXISTS mynamespace_public_v1_datasets_vis (vis uuid references mynamespace_public_v1(id) ON DELETE CASCADE, dataset uuid references mynamespace_public_v1_datasets(id) ON DELETE CASCADE);',
      'SELECT current_user as rolename',
      'GRANT SELECT on mynamespace_public_v1 TO "cartodb_publicuser_a1b2c3d4f5"',
      'GRANT SELECT on mynamespace_public_v1_datasets TO "cartodb_publicuser_a1b2c3d4f5"',
      'GRANT SELECT on mynamespace_public_v1_datasets_vis TO "cartodb_publicuser_a1b2c3d4f5"'
    ];

    // We use only one mock because is not important for the rest of the queries
    (global as any).fetch.mockResponse(
      JSON.stringify({
        rows: [
          {rolename: 'cartodb_publicuser_a1b2c3d4f5'}
        ],
        time: 0.001,
        fields: {
          rolename: {type: 'name', pgtype: 'name'}
        },
        total_rows: 1
      }),
      {
        headers: [
          ['content-type', 'application/json'],
          ['Retry-After', 0],
          ['Carto-Rate-Limit-Remaining', 5]
        ]
      }
    );
    await sqlStorage.init();

    // Check the creation and access grant queries of the 3 tables
    (global as any).fetch.mock.calls.forEach((call: any, idx: number) => {
      const params = (global as any).getURLParams(call[0]);
      expect(decodeURI(params.q)).toBe(expectedQueries[idx]);
    });
  });

  it('should list visualizations', async () => {
    const expectedQuery = 'SELECT id, name, description, thumbnail, config, last_modified, private FROM mynamespace_public_v1';

    (global as any).fetch.mockResponse(
      JSON.stringify(
        {
          rows: [
            {
              id: 'a1b2c3d4',
              name: 'myVis',
              description: 'This is a test vis',
              thumbnail: '',
              config: {},
              last_modified: '2019-11-02T14:00:00Z',
              private: false
            }
          ],
          time: 0.001,
          fields: {
            id: {type: 'string', pgtype: 'uuid'},
            name: {type: 'string', pgtype: 'text'},
            description: {type: 'string', pgtype: 'text'},
            thumbnail: {type: 'string', pgtype: 'text'},
            config: {type: 'string', pgtype: 'json'},
            last_modified: {type: 'string', pgtype: 'date'},
            private: {type: 'boolean', pgtype: 'bool'}
          },
          total_rows: 0
        }
      ),
      {
        headers: [
          ['content-type', 'application/json'],
          ['Retry-After', 0],
          ['Carto-Rate-Limit-Remaining', 5]
        ]
      }
    );

    const storedVis = await sqlStorage.getVisualizations();

    // Check list visualizations query
    const lastCall = (global as any).fetch.mock.calls[(global as any).fetch.mock.calls.length - 1];
    const params = (global as any).getURLParams(lastCall[0]);
    expect(decodeURI(params.q)).toBe(expectedQuery);

    // Check response
    expect(storedVis).toStrictEqual([STORED_VIS]);
  });

  // it('should get visualization', async () => {
  //   const completeVis = await sqlStorage.getVisualization('idVis');
  //   // Check visualization query
  //   // Check response
  // });

  // it('should create visualization', () => {
  //   const vis: Visualization = {
  //     name: 'My Vis',
  //     description: 'This is my test vis',
  //     thumbnail: '',
  //     isPrivate: false,
  //     config: '',
  //     lastModified: '2019-11-02T14:00:00.000Z'
  //   };
  //   const datasets = ['dataset1'];
  //   const overwrite = false;
  //   const response = sqlStorage.createVisualization(vis, datasets, overwrite);

  //   // Check checking dataset query
  //   // Check insert visualization query
  //   // Check response
  // });

  // it('should overwrite visualization', async () => {
  //   const vis: Visualization = {
  //     name: 'My Vis',
  //     description: 'This is my test vis to overwrite',
  //     thumbnail: '',
  //     isPrivate: false,
  //     config: '',
  //     lastModified: '2019-11-02T14:05:00.000Z'
  //   };
  //   const datasets = ['dataset1'];
  //   const overwrite = true;
  //   const response = await sqlStorage.createVisualization(vis, datasets, overwrite);

  //   // Check insert visualization query
  //   // Check response
  // });

  // it('should check existing dataset', async () => {
  //   const response = await sqlStorage.checkExistingDataset(['dataset1', 'dataset2']);
  //   // Check checking dataset query
  //   // Check response
  // });

  // it('should get dataset data', async () => {
  //   const response = await sqlStorage.getDatasetData('dataset1');
  //   // Check query
  //   // Check response
  // });

  // it('should upload dataset', async () => {
  //   const dataset: Dataset = {
  //     name: 'myData',
  //     columns: ['id', 'name', 'value'],
  //     file: 'myData.csv'
  //   };
  //   const response = await sqlStorage.uploadDataset(dataset);
  //   // Check creation query
  //   // Check copyfrom query
  //   // Check insert into datasets table
  //   // Check response
  // });

  // it('should link visualization with dataset', async () => {
  //   await sqlStorage.linkVisAndDataset('myVis1', 'dataset1');
  //   // Check query
  // });
});