import { CartoError } from '@carto/toolkit-core';
import { Layer } from '@carto/toolkit-viz';
import { DataView } from './dataview';

describe('DataView', () => {
  describe('Instance Creation', () => {
    it('should create new DataView instance', () => {
      expect(
        () => new DataView(new Layer('fake_source'), 'fake_column')
      ).not.toThrow();
    });

    it('should throw an exception when source is not provided', () => {
      expect(() => new DataView(undefined as never, 'fake_column')).toThrow(
        new CartoError({
          type: '[DataView]',
          message: 'Source was not provided while creating dataview'
        })
      );
    });

    it('should throw an exception when column is not provided', () => {
      expect(
        () => new DataView(new Layer('fake_source'), undefined as never)
      ).toThrow(
        new CartoError({
          type: '[DataView]',
          message: 'Column name was not provided while creating dataview'
        })
      );
    });
  });

  describe('Events', () => {
    it('dataUpdate', () => {
      const layer = new Layer('fake_source');
      const dataView = new DataView(layer, 'popEst');

      const dataUpdateSpy = jest.fn();
      dataView.on('dataUpdate', dataUpdateSpy);

      layer.emit('viewportLoad');

      expect(dataUpdateSpy).toHaveBeenCalled();
    });
  });
});
