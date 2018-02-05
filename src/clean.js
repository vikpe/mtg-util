// vendor
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');

// custom
const mtgUtil = require('./mtgUtil');

const filesToClean = glob.sync(mtgUtil.globs.filesToClean);
console.log(chalk`{green.bold MTG scan util (clean)}`);
console.log(chalk`{grey Removing ${filesToClean.length} file(s)..}`);
filesToClean.forEach(filePath => fs.unlinkSync(filePath));
