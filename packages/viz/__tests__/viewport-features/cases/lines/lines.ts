import { Vector3 } from '@math.gl/core';
import { ViewportFrustumPlanes } from '../../../../src/lib/interactivity/viewport-features/geometry/types';
import * as tiles from './tiles.json';

export {
  name,
  tiles,
  viewportFeaturesColumns,
  viewportFeaturesResult,
  frustumPlanes
};

const name = 'Lines';

const viewportFeaturesColumns = ['street'];

const viewportFeaturesResult = [{ street: 'FITZGERALD' }];

const frustumPlanes: ViewportFrustumPlanes = {
  near: {
    distance: 0.0023256811732884296,
    normal: new Vector3([0, 0, 1])
  },
  far: {
    distance: 0.000024918012570947397,
    normal: new Vector3([0, 0, -1])
  },
  right: {
    distance: 67.88942172945644,
    normal: new Vector3([0.828534118678061, 0, 0.5599385807268227])
  },
  left: {
    distance: -67.88663121813775,
    normal: new Vector3([-0.828534118678061, 0, 0.5599385807268227])
  },
  top: {
    distance: 297.8897836232825,
    normal: new Vector3([0, 0.9486832980841026, 0.3162277659160719])
  },
  bottom: {
    distance: -297.88820766979325,
    normal: new Vector3([0, -0.9486832980841026, 0.3162277659160719])
  }
};
