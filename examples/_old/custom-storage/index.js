import { CustomStorage } from '../../packages/custom-storage/dist/custom-storage.esm';
import { Credentials } from '../../packages/core/dist/core.esm';

let namespace;
let cs;

async function init() {
  const credentials = new Credentials(inputUsername.value, inputApiKey.value);
  namespace = inputNamespace.value;
  cs = new CustomStorage(namespace, credentials);

  const initialized = await cs.init();

  if (initialized) {
    console.log(`custom-storage for '${namespace}' has been created`);
  } else {
    console.log(`custom-storage for '${namespace}' was already prepared`);
  }
}

async function destroy() {
  await cs.destroy();
  console.log(`custom-storage for '${namespace}' has been deleted`);
}

async function load() {
  btnInit.addEventListener('click', init);
  btnDestroy.addEventListener('click', destroy);
}

load();
