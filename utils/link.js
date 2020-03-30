const { exec } = require("child_process");

const PACKAGES = [
  'auth',
  'core',
  'custom-storage',
  'maps',
  'sql',
  'viz',
  'toolkit'
];

function linkedOrNot(mode) {
  PACKAGES.forEach(package => {
    exec(`cd ./packages/${package} && npm ${mode}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`[${package}] error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`[${package}] stderr: ${stderr}`);
        return;
      }
      console.log(`[${package}]: ${stdout}`);
    });
  });
};

const commands = {
  'link': linkedOrNot.bind(undefined, 'link'),
  'unlink': linkedOrNot.bind(null, 'unlink')
}

const mode = process.argv[2];
console.log(mode);
commands[mode]();
