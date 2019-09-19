import Auth from '@carto/toolkit-auth';
import CustomViz from '@carto/toolkit-custom-viz';
import SQL from '@carto/toolkit-sql';

class Toolkit {
  constructor() {
    // tslint:disable-next-line:no-console
    console.log('Toolkit', SQL, Auth, CustomViz);
  }

  public get SQL() {
    throw new Error('No auth defined');
  }

  public get CustomViz() {
    throw new Error('No auth defined');
  }
}

export default Toolkit;