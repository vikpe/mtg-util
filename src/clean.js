// vendor
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const ora = require('ora');

// custom
const mtgUtil = require('./mtgUtil');
const spinner = ora();

const filesToClean = glob.sync(mtgUtil.globs.filesToClean);
console.log(chalk`{green.bold MTG scan util (clean)}`);
spinner.start(chalk`{grey Removing ${filesToClean.length} file(s)..}`);
filesToClean.forEach(filePath => fs.unlinkSync(filePath));
spinner.succeed().stop();
