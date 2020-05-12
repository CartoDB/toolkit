import { Vector3 } from 'math.gl';
import { ViewportFrustumPlanes } from '../../../geometry/types';
import { ViewportFeaturesOptions } from '../../../ViewportFeaturesGenerator';
import { AggregationTypes } from '../../../aggregations';
import * as tiles from './tiles.json';

export {
  name,
  tiles,
  viewportFeaturesOptions,
  viewportFeaturesResult,
  frustumPlanes
};

const name = 'Points';

const viewportFeaturesOptions: ViewportFeaturesOptions = {
  properties: ['pop_max', 'pop_min', 'adm0name', 'adm1name', 'name'],
  aggregations: {
    /* eslint-disable @typescript-eslint/camelcase */
    pop_max: [
      AggregationTypes.MAX,
      AggregationTypes.SUM,
      AggregationTypes.AVG,
      AggregationTypes.MIN
    ],
    pop_min: [AggregationTypes.MAX]
    /* eslint-enable @typescript-eslint/camelcase */
  }
};

const viewportFeaturesResult = {
  /* eslint-disable @typescript-eslint/camelcase */
  features: [
    {
      adm0name: 'Spain',
      adm1name: 'Castilla-La Mancha',
      name: 'Guadalajara',
      pop_max: 72850,
      pop_min: 30963
    },
    {
      adm0name: 'Spain',
      adm1name: 'Comunidad de Madrid',
      name: 'Madrid',
      pop_max: 5567000,
      pop_min: 50437
    },
    {
      adm0name: 'Spain',
      adm1name: 'Castilla-La Mancha',
      name: 'Toledo',
      pop_max: 74632,
      pop_min: 33125
    }
  ],
  aggregations: {
    pop_max: {
      average: 1904827.3333333333,
      max: 5567000,
      min: 72850,
      sum: 5714482
    },
    pop_min: {
      max: 50437
    }
  }
  /* eslint-enable @typescript-eslint/camelcase */
};

const frustumPlanes: ViewportFrustumPlanes = {
  near: {
    distance: 4.09229740924007,
    normal: new Vector3([0, 0, 1])
  },
  far: {
    distance: 0.043846043670429324,
    normal: new Vector3([0, 0, -1])
  },
  right: {
    distance: 238.87795770091236,
    normal: new Vector3([0.9473747608415422, 0, 0.32012663513121004])
  },
  left: {
    distance: -236.07070041610626,
    normal: new Vector3([-0.9473747608415422, 0, 0.32012663513121004])
  },
  top: {
    distance: 304.0887896731457,
    normal: new Vector3([0, 0.9486832980505175, 0.3162277660168267])
  },
  bottom: {
    distance: -301.3157223854305,
    normal: new Vector3([0, -0.9486832980505175, 0.3162277660168267])
  }
};
