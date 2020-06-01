import { CartoError } from '@carto/toolkit-core';
import { Layer } from '@carto/toolkit-viz';
import { CategoryDataView } from './category';
import { AggregationType } from '../../operations/aggregation/aggregation';

describe('DataView', () => {
  describe('Instance Creation', () => {
    it('should create new DataView instance', () => {
      expect(
        () =>
          new CategoryDataView(new Layer('fake_source'), 'fake_column', {
            operation: AggregationType.AVG,
            operationColumn: 'popEst'
          })
      ).not.toThrow();
    });

    it('should throw an exception when operation is not provided', () => {
      expect(
        () =>
          new CategoryDataView(new Layer('fake_source'), 'fake_column', {
            operation: undefined as never,
            operationColumn: 'fake_operation_column'
          })
      ).toThrow(
        new CartoError({
          type: '[DataView]',
          message:
            'Operation property not provided while creating dataview. Please check documentation.'
        })
      );
    });

    it('should throw an exception when operationColumn is not provided', () => {
      expect(
        () =>
          new CategoryDataView(undefined as never, 'fake_column', {
            operation: AggregationType.AVG,
            operationColumn: undefined as never
          })
      ).toThrow(
        new CartoError({
          type: '[DataView]',
          message:
            'Operation column property not provided while creating dataview. Please check documentation.'
        })
      );
    });
  });

  describe('getData', () => {
    it('should return categories and stats grouped by column', async () => {
      const layer = new Layer('fake_source');
      spyOn(layer, 'getViewportFeatures').and.returnValue(
        Promise.resolve(sourceDataToGroup)
      );

      const dataView = new CategoryDataView(layer, 'country', {
        operation: AggregationType.AVG,
        operationColumn: 'popEst'
      });

      expect(await dataView.getData()).toMatchObject({
        categories: [
          { name: 'Country 2', value: 15 },
          { name: 'Country 4', value: 35 },
          { name: 'Country 5', value: 50 }
        ],
        count: 3,
        operation: AggregationType.AVG,
        max: 50,
        min: 15,
        nullCount: 0
      });
    });
  });
});

const sourceDataToGroup = [
  { country: 'Country 2', popEst: 10 },
  { country: 'Country 2', popEst: 20 },
  { country: 'Country 4', popEst: 30 },
  { country: 'Country 4', popEst: 40 },
  { country: 'Country 5', popEst: 50 }
];
