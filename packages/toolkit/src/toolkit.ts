import * as Auth from '@carto/toolkit-auth';
import * as CustomStorage from '@carto/toolkit-custom-storage';
import * as Maps from '@carto/toolkit-maps';
import * as SQL from '@carto/toolkit-sql';

class Toolkit {
  constructor() {
    // tslint:disable-next-line:no-console
    console.log('Toolkit', Auth, CustomStorage, Maps, SQL);
  }

  public get SQL() {
    throw new Error('No auth defined');
  }

  public get CustomStorage() {
    throw new Error('No auth defined');
  }
}

export default Toolkit;
