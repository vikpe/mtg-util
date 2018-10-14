// vendor
const chalk = require('chalk');
const ora = require('ora');
const PQueue = require('p-queue');
const _chunk = require('lodash/chunk');

// config
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');
const config = require('./../mtgUtilConfig');
const spinner = ora();

const frontsideFilePaths = mtgUtil.getFrontsideFilePaths();

const gallerizeImages = (imageFilePaths, index) => new global.Promise(resolve => {
  const galleryNumber = index + 1;
  const numberOfImagesPerRow = 4;
  const numberOfRows = 3;
  const numberOfImagesPerGallery = numberOfImagesPerRow * numberOfRows;

  let imageNumberFrom = 1 + (index * numberOfImagesPerGallery);
  let imageNumberTo = imageNumberFrom + (numberOfImagesPerGallery - 1);
  spinner.start(`Gallery ${galleryNumber} (${imageNumberFrom}-${imageNumberTo})`);

  const outputPath = `${config.output.dir}/gallery-${galleryNumber}.jpg`;

  imageUtil
    .readImages(imageFilePaths)
    .then(images => imageUtil.gallerize(images))
    .then(galleryImage => galleryImage.write(outputPath, () => {
      spinner.succeed().stop();
      resolve();
    }));
});

const queue = new PQueue({concurrency: 1});

const run = () => {
  console.log("\n");
  console.log(chalk`{green.bold MTG scan util (gallerize)}`);
  console.log(chalk`{grey Found ${frontsideFilePaths.length} card(s)..}`);

  let galleryIndex = -1;
  const numberOfImagesPerRow = 4;
  const numberOfRows = 3;
  const numberOfImagesPerGallery = numberOfImagesPerRow * numberOfRows;
  const imageChunks = _chunk(frontsideFilePaths, numberOfImagesPerGallery);

  imageChunks.forEach(imageFilePaths => {
    queue.add(() => {
      galleryIndex++;
      return gallerizeImages(imageFilePaths, galleryIndex)
    });
  });
};

if (config.output.writeGalleries) {
  run();
}
