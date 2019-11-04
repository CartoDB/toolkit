export const CHECK_CREATE_QUERIES = [
  'CREATE TABLE IF NOT EXISTS mynamespace_public_v1 (id uuid PRIMARY KEY DEFAULT mynamespace_create_uuid(), name text NOT NULL, description text, thumbnail text, private boolean, config json, last_modified timestamp NOT NULL DEFAULT now());',
  'CREATE TABLE IF NOT EXISTS mynamespace_public_v1_datasets (id uuid PRIMARY KEY DEFAULT mynamespace_create_uuid(), tablename text UNIQUE NOT NULL, name text UNIQUE NOT NULL);',
  'CREATE TABLE IF NOT EXISTS mynamespace_public_v1_datasets_vis (vis uuid references mynamespace_public_v1(id) ON DELETE CASCADE, dataset uuid references mynamespace_public_v1_datasets(id) ON DELETE CASCADE);',
  'SELECT current_user as rolename',
  'GRANT SELECT on mynamespace_public_v1 TO "cartodb_publicuser_a1b2c3d4f5"',
  'GRANT SELECT on mynamespace_public_v1_datasets TO "cartodb_publicuser_a1b2c3d4f5"',
  'GRANT SELECT on mynamespace_public_v1_datasets_vis TO "cartodb_publicuser_a1b2c3d4f5"'
];

export const LIST_VISUALIZATION_QUERY = 'SELECT id, name, description, thumbnail, config, last_modified, private FROM mynamespace_public_v1';
