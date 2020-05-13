import { Vector3 } from '@math.gl/core';
import { ViewportFrustumPlanes } from '../../../../src/lib/interactivity/viewport-features/geometry/types';
import { ViewportFeaturesOptions } from '../../../../src/lib/interactivity/viewport-features/ViewportFeaturesGenerator';
import { AggregationTypes } from '../../../../src/lib/interactivity/viewport-features/aggregations';
import * as tiles from './tiles.json';

export {
  name,
  tiles,
  viewportFeaturesOptions,
  viewportFeaturesResult,
  frustumPlanes
};

const name = 'Polygons';

const viewportFeaturesOptions: ViewportFeaturesOptions = {
  properties: ['name', 'pop_est'],
  aggregations: {
    /* eslint-disable @typescript-eslint/camelcase */
    pop_est: [AggregationTypes.COUNT]
    /* eslint-enable @typescript-eslint/camelcase */
  }
};

const viewportFeaturesResult = {
  /* eslint-disable @typescript-eslint/camelcase */
  features: [
    {
      name: 'New Zealand',
      pop_est: 4213418
    }
  ],
  aggregations: {
    pop_est: {
      count: 1
    }
  }
  /* eslint-enable @typescript-eslint/camelcase */
};

const frustumPlanes: ViewportFrustumPlanes = {
  near: {
    distance: 48.06599592697578,
    normal: new Vector3([0, 0, 1])
  },
  far: {
    distance: 0.5149928135033051,
    normal: new Vector3([0, 0, -1])
  },
  right: {
    distance: 476.8705880716162,
    normal: new Vector3([0.9202638569211192, 0, 0.39129839463594246])
  },
  left: {
    distance: -436.56741583703763,
    normal: new Vector3([-0.9202638569211192, 0, 0.39129839463594246])
  },
  top: {
    distance: 200.317060301175,
    normal: new Vector3([0, 0.948683298050513, 0.3162277660168403])
  },
  bottom: {
    distance: -167.74605491539904,
    normal: new Vector3([0, -0.948683298050513, 0.3162277660168403])
  }
};
