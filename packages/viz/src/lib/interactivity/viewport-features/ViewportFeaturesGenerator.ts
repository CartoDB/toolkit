import { DeckGL, Layer, Viewport } from 'deck.gl';
import {
  getTransformationMatrixFromTile,
  transformGeometryCoordinatesToCommonSpace
} from './geometry/transform';
import { checkIfGeometryIsInsideFrustum } from './geometry/check';
import { DeckTile, GeometryData } from './geometry/types';

const DEFAULT_OPTIONS = {
  // This may not fit in a more general model
  uniqueIdProperty: 'cartodb_id'
};

export class ViewportFeaturesGenerator {
  // TODO: Add docs
  private deckInstance: DeckGL | undefined;
  private deckLayer: Layer<never> | undefined;
  private uniqueIdProperty: string;

  // Should add a total cache for features when viewport is not changed
  constructor(
    deckInstance?: DeckGL,
    deckLayer?: Layer<never>,
    options: ViewportFeaturesGeneratorOptions = DEFAULT_OPTIONS
  ) {
    const { uniqueIdProperty = DEFAULT_OPTIONS.uniqueIdProperty } = options;

    this.deckInstance = deckInstance;
    this.deckLayer = deckLayer;
    this.uniqueIdProperty = uniqueIdProperty;
  }

  public isReady() {
    return Boolean(this.deckInstance) && Boolean(this.deckLayer);
  }

  public getFeatures() {
    const selectedTiles = this.getSelectedTiles();
    return this.getViewportFilteredFeatures(selectedTiles);
  }

  private getViewportFilteredFeatures(selectedTiles: DeckTile[]) {
    // TODO: Return promise when tiles are still loading
    const currentFrustumPlanes = this.getFrustumPlanes();
    const featureCache = new Set<number>();

    return selectedTiles
      .map(tile => {
        const coordsTransformationMatrix = getTransformationMatrixFromTile(
          tile
        );
        // TODO(jbotella): Change types when Deck.gl types are updated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const features = (tile as any).content as GeoJSON.Feature[];

        return features.filter(feature => {
          if (!feature.properties) {
            return false;
          }

          const featureId: number =
            feature.properties[this.uniqueIdProperty] || feature.id;

          // Prevent checking feature across tiles
          // that are already visible
          if (featureCache.has(featureId)) {
            return false;
          }

          // TODO(jbotella): Should convert `checkIfGeometryIsInsideFrustum` to ViewportGeometryChecker?
          const isInside = checkIfGeometryIsInsideFrustum(
            transformGeometryCoordinatesToCommonSpace(
              feature.geometry as GeometryData,
              coordsTransformationMatrix
            ),
            currentFrustumPlanes
          );

          if (isInside) {
            featureCache.add(featureId);
          }

          return isInside;
        });
      })
      .flat();
  }

  private getSelectedTiles() {
    if (!this.deckLayer) {
      return [];
    }

    return this.deckLayer.state.tileset.selectedTiles;
  }

  private getFrustumPlanes() {
    // WebMercatorViewport is there by default
    // TODO(jbotella): Change types when Deck.gl types are updated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewports: Viewport[] = (this.deckInstance as any).getViewports();
    return viewports[0].getFrustumPlanes();
  }

  public setDeckInstance(deckInstance: DeckGL) {
    // TODO: Wipe future cache and so on
    this.deckInstance = deckInstance;
  }

  public setDeckLayer(deckLayer: Layer<never>) {
    // TODO: Wipe future cache and so on
    this.deckLayer = deckLayer;
  }
}

interface ViewportFeaturesGeneratorOptions {
  uniqueIdProperty?: string;
}
