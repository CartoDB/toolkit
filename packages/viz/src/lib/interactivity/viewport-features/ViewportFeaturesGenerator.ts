import { Deck, Viewport } from '@deck.gl/core';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Matrix4 } from 'math.gl';
import {
  getTransformationMatrixFromTile,
  transformGeometryCoordinatesToCommonSpace
} from './geometry/transform';
import { checkIfGeometryIsInsideFrustum } from './geometry/check';
import {
  GeometryData,
  ViewportTile,
  ViewportFrustumPlanes
} from './geometry/types';
import { selectPropertiesFrom } from '../../utils/object';
import { AggregationTypes, applyAggregations } from './aggregations';

const DEFAULT_OPTIONS = {
  uniqueIdProperty: 'cartodb_id'
};

const DEFAULT_GET_FEATURES_OPTIONS = {
  properties: [],
  aggregations: {}
};

export class ViewportFeaturesGenerator {
  // TODO: Add docs
  private deckInstance: Deck | undefined;
  private deckLayer: MVTLayer<string> | undefined;
  private uniqueIdProperty: string;

  constructor(
    deckInstance?: Deck,
    deckLayer?: MVTLayer<string>,
    options: ViewportFeaturesGeneratorOptions = DEFAULT_OPTIONS
  ) {
    const { uniqueIdProperty = DEFAULT_OPTIONS.uniqueIdProperty } = options;

    this.deckInstance = deckInstance;
    this.deckLayer = deckLayer;
    this.uniqueIdProperty = uniqueIdProperty;
  }

  isReady() {
    return Boolean(this.deckInstance) && Boolean(this.deckLayer);
  }

  getFeatures(options: ViewportFeaturesOptions = DEFAULT_GET_FEATURES_OPTIONS) {
    const {
      properties = DEFAULT_GET_FEATURES_OPTIONS.properties,
      aggregations = DEFAULT_GET_FEATURES_OPTIONS.aggregations
    } = options;

    const selectedTiles = this.getSelectedTiles();

    const features = this.getViewportFilteredFeatures(
      selectedTiles,
      properties
    );

    return {
      features,
      aggregations: applyAggregations(features, aggregations)
    };
  }

  private getViewportFilteredFeatures(
    selectedTiles: ViewportTile[],
    properties: string[]
  ) {
    const currentFrustumPlanes = this.getFrustumPlanes();
    const featureCache = new Set<number>();

    return selectedTiles
      .map(tile => {
        const transformationMatrix = getTransformationMatrixFromTile(tile);
        const features = tile.content || [];

        const featuresWithinViewport = features.filter(feature => {
          return this.isInsideViewport(feature, {
            featureCache,
            transformationMatrix,
            currentFrustumPlanes
          });
        });

        return featuresWithinViewport.map(feature =>
          selectPropertiesFrom(
            feature.properties as Record<string, unknown>,
            properties
          )
        );
      })
      .flat();
  }

  private isInsideViewport(
    feature: GeoJSON.Feature,
    options: InsideViewportCheckOptions
  ) {
    const {
      featureCache,
      transformationMatrix,
      currentFrustumPlanes
    } = options;

    if (!feature.properties) {
      return false;
    }

    const featureId: number =
      feature.properties[this.uniqueIdProperty] || feature.id;

    if (featureCache.has(featureId)) {
      // Prevent checking feature across tiles
      // that are already visible
      return false;
    }

    const isInside = checkIfGeometryIsInsideFrustum(
      transformGeometryCoordinatesToCommonSpace(
        feature.geometry as GeometryData,
        transformationMatrix
      ),
      currentFrustumPlanes
    );

    if (isInside) {
      featureCache.add(featureId);
    }

    return isInside;
  }

  private getSelectedTiles() {
    if (!this.deckLayer) {
      return [];
    }

    return this.deckLayer.state.tileset.selectedTiles;
  }

  private getFrustumPlanes() {
    // WebMercatorViewport is there by default
    const viewports: Viewport[] = this.deckInstance?.getViewports(undefined);
    return viewports[0].getFrustumPlanes();
  }

  public setDeckInstance(deckInstance: Deck) {
    this.deckInstance = deckInstance;
  }

  public setDeckLayer(deckLayer: MVTLayer<string>) {
    this.deckLayer = deckLayer;
  }
}

interface ViewportFeaturesGeneratorOptions {
  uniqueIdProperty?: string;
}

export interface ViewportFeaturesOptions {
  properties: string[];
  aggregations: Record<string, AggregationTypes[]>;
}

interface InsideViewportCheckOptions {
  featureCache: Set<number>;
  transformationMatrix: Matrix4;
  currentFrustumPlanes: ViewportFrustumPlanes;
}
