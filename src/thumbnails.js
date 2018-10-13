// vendor
const chalk = require('chalk');
const glob = require('glob');
const Jimp = require('jimp');
const ora = require('ora');
const PQueue = require('p-queue');

// custom
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');
const spinner = ora();

const writeThumbnail = (sourceFilePath, imageData) => new global.Promise(resolve => {
  spinner.start(chalk`${sourceFilePath} (thumbnail)`);

  const distFilePath = sourceFilePath.replace('.jpg', '-thumb.jpg');

  imageData
    .quality(config.output.imageQuality)
    .scale(config.output.thumbnailScale)
    .write(distFilePath, () => {
      spinner.succeed().stop();
      resolve();
    });
});

const run = () => {
  const imageFilePaths = glob.sync(mtgUtil.globs.allDistFiles).sort();

  console.log(chalk`{green.bold MTG scan util (thumbnails)}`);
  console.log(chalk`{grey Found ${imageFilePaths.length} image(s)..}`);

  const queue = new PQueue({concurrency: 1});

  imageFilePaths.forEach((imageFilePath) => {
    Jimp.read(imageFilePath).then(imageData => {
      queue.add(() => writeThumbnail(imageFilePath, imageData));
    });
  });
}

if (config.output.writeThumbnails) {
  run();
}

