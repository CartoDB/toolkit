import { Deck } from '@deck.gl/core';
import { MVTLayer } from '@deck.gl/geo-layers';
import { ViewportFeaturesGenerator } from '../../src/lib/interactivity/viewport-features/ViewportFeaturesGenerator';
import {
  createDeckInstance,
  createFakeDeckGlInstance,
  createFakeLayerWithSelectedTiles,
  createViewport
} from './cases/utils';

// Test Cases
import { testCases } from './cases';

describe('ViewportFeaturesGenerator', () => {
  describe('Instance Creation', () => {
    it('should create new ViewportFeaturesGenerator instance', () => {
      const layerInstance = new MVTLayer<string>({});
      const deckInstance = createDeckInstance({
        layers: [layerInstance as any]
      });

      expect(
        () => new ViewportFeaturesGenerator(deckInstance, layerInstance)
      ).not.toThrow();
    });

    it('should create new ViewportFeaturesGenerator instance without arguments', () => {
      expect(() => new ViewportFeaturesGenerator()).not.toThrow();
    });
  });

  describe('isReady', () => {
    it('should return false if deckInstance is not present', () => {
      const vfGenerator = new ViewportFeaturesGenerator(
        undefined,
        new MVTLayer<string>({})
      );
      expect(vfGenerator.isReady()).toBe(false);
    });

    it('should return false if deckLayer is not present', () => {
      const deckInstance = createDeckInstance();
      const vfGenerator = new ViewportFeaturesGenerator(
        deckInstance,
        undefined
      );
      expect(vfGenerator.isReady()).toBe(false);
    });

    it('should return true if deckInstance and deckLayer are present', () => {
      const deckInstance = createDeckInstance();
      const vfGenerator = new ViewportFeaturesGenerator(
        deckInstance,
        new MVTLayer<string>({})
      );
      expect(vfGenerator.isReady()).toBe(true);
    });
  });

  describe('getFeatures', () => {
    it.each(testCases)('%#', async testCase => {
      const mvtLayer = createFakeLayerWithSelectedTiles(
        testCase.tiles as any
      ) as MVTLayer<string>;

      const deckInstance = createFakeDeckGlInstance({
        viewports: [createViewport({ frustumPlanes: testCase.frustumPlanes })]
      }) as unknown;

      const vfGenerator = new ViewportFeaturesGenerator(
        deckInstance as Deck,
        mvtLayer
      );

      const viewportFeatures = await vfGenerator.getFeatures(
        testCase.viewportFeaturesColumns
      );
      expect(viewportFeatures).toEqual(testCase.viewportFeaturesResult);
    });
  });
});
