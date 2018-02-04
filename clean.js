// vendor
const chalk = require('chalk');
const fs = require('fs');

// config
const config = require('./mtgUtilConfig');

console.log(chalk`{green.bold MTG scan util (clean)}`);

const combinedFileNameRegex = /card-\d+-c/g;

const nonCombinedFilePaths = fs
  .readdirSync(config.output.dir)
  .filter(fileName => !combinedFileNameRegex.test(fileName))
  .sort();

console.log(chalk`{grey Found ${nonCombinedFilePaths.length} card(s)..}`);

nonCombinedFilePaths.forEach(fileName => {
  const filePath = `${config.output.dir}/${fileName}`;
  fs.unlinkSync(filePath);
});
