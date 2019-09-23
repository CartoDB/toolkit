import * as Auth from '@carto/toolkit-auth';
import * as CustomViz from '@carto/toolkit-custom-viz';
import * as Maps from '@carto/toolkit-maps';
import * as SQL from '@carto/toolkit-sql';

class Toolkit {
  constructor() {
    // tslint:disable-next-line:no-console
    console.log('Toolkit', Auth, CustomViz, Maps, SQL);
  }

  public get SQL() {
    throw new Error('No auth defined');
  }

  public get CustomViz() {
    throw new Error('No auth defined');
  }
}

export default Toolkit;