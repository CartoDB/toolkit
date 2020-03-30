import DDL from '../src/DDL';

describe('DDL', () => {
  it('should generate DROP queries', () => {
    expect(DDL.drop('wadus')).toBe('DROP TABLE wadus;');
  });

  it('should generate DROP queries with options', () => {
    const tableName = 'wadus';

    const query = DDL.drop(tableName, {
      ifExists: true
    });

    expect(query).toBe('DROP TABLE IF EXISTS wadus;');
  });

  it('should generate CREATE TABLE with row literals', () => {
    expect(DDL.create('wadus', ['id numeric PRIMARY KEY'])).toBe('CREATE TABLE wadus (id numeric PRIMARY KEY);');
  });

  it('should be able to generate CREATE TABLE IF NOT EXISTS', () => {
    expect(
      DDL.create('wadus', ['id numeric PRIMARY KEY'], { ifNotExists: true })
    ).toBe('CREATE TABLE IF NOT EXISTS wadus (id numeric PRIMARY KEY);');
  });

  it('should be able to create tables based on a json config', () => {
    expect(
      DDL.create('wadus', [
        {
          name: 'id',
          type: 'numeric',
          extra: 'PRIMARY KEY'
        },
        {
          name: 'name',
          type: 'string',
          extra: 'NOT NULL'
        }
      ])
    ).toBe(`CREATE TABLE wadus (\"id\" numeric PRIMARY KEY, \"name\" text NOT NULL);`);
  });
});
