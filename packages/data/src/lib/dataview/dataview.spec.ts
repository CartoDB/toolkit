import { Layer } from '@carto/toolkit-viz';
import { DataView } from './dataview';
import { CartoDataViewError, dataViewErrorTypes } from './DataViewError';

describe('DataView', () => {
  describe('Instance Creation', () => {
    it('should create new DataView instance', () => {
      expect(
        () => new DataView(new Layer('fake_source'), 'fake_column')
      ).not.toThrow();
    });

    it('should throw an exception when source is not provided', () => {
      expect(() => new DataView(undefined as never, 'fake_column')).toThrow(
        new CartoDataViewError(
          'Source was not provided while creating dataview',
          dataViewErrorTypes.PROPERTY_MISSING
        )
      );
    });

    it('should throw an exception when column is not provided', () => {
      expect(
        () => new DataView(new Layer('fake_source'), undefined as never)
      ).toThrow(
        new CartoDataViewError(
          'Column name was not provided while creating dataview',
          dataViewErrorTypes.PROPERTY_MISSING
        )
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
