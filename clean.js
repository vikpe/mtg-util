// vendor
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');

// config
const config = require('./mtgUtilConfig');

console.log(chalk`{green.bold MTG scan util (clean)}`);

glob(`${config.output.dir}/*-card-*-[ab].*`, (err, filesToDelete) => {
  console.log(chalk`{grey Removing ${filesToDelete.length} file(s)..}`);
  filesToDelete.forEach(filePath => fs.unlinkSync(filePath));
});
