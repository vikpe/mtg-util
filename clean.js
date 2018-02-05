// vendor
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const config = require('./mtgUtilConfig');

const filesToDelete = glob.sync(`${config.output.dir}/*-card-*-[abt].*`);
console.log(chalk`{green.bold MTG scan util (clean)}`);
console.log(chalk`{grey Removing ${filesToDelete.length} file(s)..}`);
filesToDelete.forEach(filePath => fs.unlinkSync(filePath));
