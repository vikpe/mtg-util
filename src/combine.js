// vendor
const chalk = require('chalk');
const ora = require('ora');
const PQueue = require('p-queue');

// config
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');
const spinner = ora();

const frontsideFilePaths = mtgUtil.getFrontsideFilePaths();

console.log(chalk`{green.bold MTG scan util (combine)}`);
console.log(chalk`{grey Found ${frontsideFilePaths.length} card(s)..}`);

const combineImages = (filePath) => new global.Promise(resolve => {
  spinner.start(filePath.replace('-front-', '-*-'));

  const frontsidePath = filePath;
  const backsidePath = frontsidePath.replace('-front-', '-back-');
  const combinedPath = frontsidePath.replace('-front-', '-combined-');

  imageUtil
    .readImages([frontsidePath, backsidePath])
    .then(images => imageUtil.combineHorizontally(images))
    .then(combinedImage => combinedImage.write(combinedPath, () => {
      spinner.succeed().stop();
      resolve();
    }));
});

const queue = new PQueue({ concurrency: 1 });

frontsideFilePaths.forEach(filePath => {
  queue.add(() => combineImages(filePath));
});
