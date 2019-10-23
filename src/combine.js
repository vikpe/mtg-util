// vendor
const chalk = require('chalk');
const ora = require('ora');
const {default: PQueue} = require('p-queue');

// config
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');
const spinner = ora();

const pocketFrontsideFilePaths = mtgUtil.getFrontsideFilePaths();

console.log("\n");
console.log(chalk`{green.bold MTG scan util (combine)}`);
console.log(chalk`{grey Found ${pocketFrontsideFilePaths.length} card(s)..}`);

const combineImages = (frontsideFilePath) => new global.Promise(resolve => {
  spinner.start(frontsideFilePath.replace('-front-', '-*-'));

  const frontsidePath = frontsideFilePath;
  const backsidePath = frontsidePath.replace('-front-', '-back-');
  const combinedPath = frontsidePath.replace('-front-pocket-', '-card-');

  imageUtil
    .readImages([frontsidePath, backsidePath])
    .then(images => imageUtil.combineHorizontally(images))
    .then(combinedImage => combinedImage.write(combinedPath, () => {
      spinner.succeed().stop();
      resolve();
    }));
});

const queue = new PQueue({ concurrency: 1 });

pocketFrontsideFilePaths.forEach(filePath => {
  queue.add(() => combineImages(filePath));
});
