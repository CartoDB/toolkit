class Source {
  private _sourceType: string;
  private _sourceValue: string;

  constructor(source: string) {
    this._sourceType = getSourceType(source);
    this._sourceValue = source;
  }

  public getSourceOptions() {
    return { [this._sourceType]: this._sourceValue };
  }
}

function getSourceType(source: string) {
  const containsSpace = source.search(' ') > -1;

  if (containsSpace) {
    return 'sql';
  }

  return 'dataset';
}

export default Source;
