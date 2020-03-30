// Some common aliases
const TYPE_MAP = {
  string: 'text',
  integer: 'numeric',
  geojson: 'json'
} as {
  [key: string]: string
};

export interface ColumConfig {
  /**
   * Name of the column
   */
  name: string;

  /**
   * PostgreSQL column's type
   */
  type: string;

  /**
   * Extra information to append in column creation
   */
  extra?: string;

  /**
   * Avoid adding property when inserting a new row in the table
   */
  omitOnInsert?: boolean;

  /**
   * Formatting for column value before being appended to SQL sentence
   */
  format?: (value: any) => boolean | string | null;
}

export interface DropOptions {
  ifExists?: boolean;
}

export interface CreateConfig {
  ifNotExists?: boolean;
}

export class DDL {
  public static drop(tableName: string, options?: any) {
    if (options && options.ifExists) {
      return `DROP TABLE IF EXISTS ${tableName};`;
    }

    return `DROP TABLE ${tableName};`;
  }

  public static create(tableName: string, rows: Array<ColumConfig | string>, options?: any) {
    let template = `CREATE TABLE ${tableName} ({rows});`;

    if (options && options.ifNotExists) {
      template = `CREATE TABLE IF NOT EXISTS ${tableName} ({rows});`;
    }

    const sqlRows = rows.map((row) => {
      if (typeof row === 'string') {
        return row;
      }

      row.type = parseRowType(row.type);

      const rowStr = `"${row.name}" ${row.type}`;

      return row.extra ? `${rowStr} ${row.extra}` : rowStr;
    }).join(', ');

    return template.replace(/{rows}/, sqlRows);
  }
}

function parseRowType(value: string): string {
  return TYPE_MAP[value] || value;
}

export default DDL;
