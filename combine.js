// vendor
const chalk = require('chalk');
const fs = require('fs');
const Jimp = require('jimp');
const ora = require('ora');

// config
const config = require('./mtgUtilConfig');

console.log(chalk`{green.bold MTG scan util (combine)}`);

const frontSideFilenameRegex = /card-\d+-a/g;

const frontSideScans = fs
  .readdirSync(config.output.dir)
  .filter(fileName => frontSideFilenameRegex.test(fileName))
  .sort();

console.log(chalk`{grey Found ${frontSideScans.length} card(s)..}`);

let spinner = new ora();
spinner.enabled = true;

const combineImagesHorizontally = (frontSide, backSide, filePath) => {
  const resultWidth = frontSide.bitmap.width + backSide.bitmap.width;
  const resultHeight = Math.max(frontSide.bitmap.height, backSide.bitmap.height);

  new Jimp(resultWidth, resultHeight, (err, combinedImage) => {
    if (err) {
      throw err;
    }

    combinedImage
      .blit(frontSide, 0, 0)
      .blit(backSide, frontSide.bitmap.width, 0)
      .write(filePath, () => {
        spinner.succeed().stop();
      });
  });
};

const processCard = filePath => {
  spinner.start(filePath.replace('-a.jpg', ''));

  const promises = [
    Jimp.read(filePath),
    Jimp.read(filePath.replace('-a.', '-b.'))
  ];

  global.Promise.all(promises).then(result => {
    combineImagesHorizontally(
      result[0],
      result[1],
      filePath.replace('-a.', '-c.')
    );
  });
};

frontSideScans.forEach(fileName => {
  const filePath = `${config.output.dir}/${fileName}`;
  processCard(filePath);
});
