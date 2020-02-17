import MetricsEvent from '../src/MetricsEvent';

describe('core/MetricsEvent', () => {
  it('can be created easily', () => {
    const event = new MetricsEvent('mytestlib', 'name of this test');

    expect(event.source).toBe('mytestlib');
    expect(event.name).toBe('name of this test');
    expect(event.groupId).toBeTruthy();
  });

  it('can be created with a custom id', () => {
    const event = new MetricsEvent('mytestlib', 'name of this test', 'id');

    expect(event.source).toBe('mytestlib');
    expect(event.name).toBe('name of this test');
    expect(event.groupId).toBe('id');
  });

  it('can generate proper headers', () => {
    const event = new MetricsEvent('mytestlib', 'name of this test', 'id');

    const headers = event.getHeaders();
    expect(headers).toBeTruthy();
    expect(headers[0]).toEqual(['Carto-Event-Source', 'mytestlib']);
    expect(headers[1]).toEqual(['Carto-Event', 'name of this test']);
    expect(headers[2]).toEqual(['Carto-Event-Group-Id', 'id']);
  });
});
