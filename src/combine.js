// vendor
const chalk = require('chalk');
const ora = require('ora');

// config
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');

const frontsideFilePaths = mtgUtil.getFrontsideFilePaths();

console.log(chalk`{green.bold MTG scan util (combine)}`);
console.log(chalk`{grey Found ${frontsideFilePaths.length} card(s)..}`);

frontsideFilePaths.forEach(filePath => {
  const frontsidePath = filePath;
  const backsidePath = frontsidePath.replace('-front-', '-back-');
  const combinedPath = frontsidePath.replace('-front-', '-combined-');

  const spinner = new ora().start(filePath);

  imageUtil
    .readImages([frontsidePath, backsidePath])
    .then(images => imageUtil.combineHorizontally(images))
    .then(combinedImage => combinedImage.write(combinedPath, () => {
      spinner.succeed().stop();
    }));
});
