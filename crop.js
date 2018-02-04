// vendor
const chalk = require('chalk');
const fs = require('fs');
const Jimp = require('jimp');
const ora = require('ora');

// config
const config = require('./mtgUtilConfig');

const processImage = (scanNumber, filePath) => {
  const isFrontScan = (1 === (scanNumber % 2));
  const sheetNumber = Math.floor((1 + scanNumber) / 2);
  const fileNameSuffix = (isFrontScan) ? 'a' : 'b';

  let fileSpinner = new ora().start(chalk`${filePath} - {grey overview}`);

  Jimp.read(filePath).then(image => {
    // crop (and rotate frontside scan)
    image = image.crop(0, 0, config.sheet.width, config.sheet.height);

    if (isFrontScan) {
      image = image.rotate(180);
    }

    // overview
    image
      .clone()
      .resize(config.output.overviewWidth, Jimp.AUTO)
      .quality(config.output.imageQuality)
      .write(`${config.output.dir}/sheet-${sheetNumber}-${fileNameSuffix}.jpg`);

    // pockets
    const slotWidth = Math.floor(config.sheet.width / config.sheet.cols);
    const slotHeight = Math.floor(config.sheet.height / config.sheet.rows);

    const numberOfPocketsPerSheet = config.sheet.rows * config.sheet.cols;

    for (let cardIndex = 0; cardIndex < numberOfPocketsPerSheet; cardIndex++) {
      const rowIndex = Math.floor(cardIndex / config.sheet.rows);
      const colIndex = (cardIndex % config.sheet.cols);

      let slotNumber;

      if (isFrontScan) {
        slotNumber = cardIndex + 1;
      }
      else {
        slotNumber = (config.sheet.cols * (rowIndex + 1)) - colIndex;
      }

      fileSpinner.start(chalk`${filePath} - {grey slot ${slotNumber}}`);

      const distFileName = `sheet-${sheetNumber}-card-${slotNumber}-${fileNameSuffix}.jpg`;
      const distFilePath = `${config.output.dir}/${distFileName}`;

      let result = image
        .clone()
        .crop(
          colIndex * slotWidth,
          rowIndex * slotHeight,
          slotWidth,
          slotHeight
        );

      if ('auto' !== config.output.cardWidth) {
        result.resize(config.output.cardWidth, Jimp.AUTO);
      }

      result.write(distFilePath);

      fileSpinner.stop();
    }

    fileSpinner.succeed(filePath);

  }).catch(err => console.log(err));
};

const inputDir = 'scans';

console.log(chalk`{green.bold MTG scan util (crop)}`);
const scans = fs.readdirSync(inputDir).sort();
console.log(chalk`{grey Found ${scans.length} scan(s)..}`);

scans.forEach((fileName, index) => {
  const scanNumber = index + 1;
  processImage(scanNumber, `${inputDir}/${fileName}`);
});
