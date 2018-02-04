const argv = require('yargs').argv;
const Jimp = require('jimp');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');

const sheetConfig = {
  width: 2048,
  height: 2806,
  rows: 3,
  cols: 3
};

sheetConfig.slotWidth = Math.floor(sheetConfig.width / sheetConfig.cols);
sheetConfig.slotHeight = Math.floor(sheetConfig.height / sheetConfig.rows);
sheetConfig.numberOfPockets = sheetConfig.rows * sheetConfig.cols;
;

const inputDir = 'scans';

const outputConfig = {
  dir: 'dist',
  imageQuality: 90,
  overviewWidth: 1024
};

const processImage = (scanNumber, filePath) => {
  const isFrontScan = (1 === (scanNumber % 2));
  const sheetNumber = (isFrontScan) ? scanNumber : scanNumber-1;
  const fileNameSuffix = (isFrontScan) ? 'a' : 'b';

  Jimp.read(filePath).then(image => {

    let fileSpinner = new ora();
    fileSpinner.enabled = true;

    // crop (rotate is needed)
    image = image.crop(0, 0, sheetConfig.width, sheetConfig.height);

    if (isFrontScan) {
      image = image.rotate(180);
    }

    // overview
    fileSpinner.start(chalk`${filePath} - {grey overview}`);

    image
      .clone()
      .resize(outputConfig.overviewWidth, Jimp.AUTO)
      .quality(outputConfig.imageQuality)
      .write(`${outputConfig.dir}/${sheetNumber}-overview-${fileNameSuffix}.jpg`);

    // pockets
    for (let cardIndex = 0; cardIndex < sheetConfig.numberOfPockets; cardIndex++) {
      const rowIndex = Math.floor(cardIndex / sheetConfig.rows);
      const colIndex = (cardIndex % sheetConfig.cols);

      let slotNumber;

      if (isFrontScan) {
        slotNumber = cardIndex + 1;
      }
      else {
        slotNumber = (sheetConfig.cols * (rowIndex + 1)) - colIndex;
      }

      fileSpinner.start(chalk`${filePath} - {grey slot ${slotNumber} of ${sheetConfig.numberOfPockets}}`);

      const distFileName = `${sheetNumber}-${slotNumber}-${fileNameSuffix}.jpg`;
      const distFilePath = `${outputConfig.dir}/${distFileName}`;

      image
        .clone()
        .crop(
          colIndex * sheetConfig.slotWidth,
          rowIndex * sheetConfig.slotHeight,
          sheetConfig.slotWidth,
          sheetConfig.slotHeight
        )
        .write(distFilePath);

      fileSpinner.stop();
    }

    fileSpinner.succeed(filePath).stop();

  }).catch(err => console.log(err));
};

console.log(chalk`{green.bold MTG scan util}`);
const scans = fs.readdirSync(inputDir).sort();
console.log(chalk`{grey Found ${scans.length} scan(s)..}`);

scans.forEach((fileName, index) => {
  const scanNumber = index + 1;
  processImage(scanNumber, `${inputDir}/${fileName}`);
});

/*
if (argv.ships > 3 && argv.distance < 53.5) {
  console.log('Plunder more riffiwobbles!');
} else {
  console.log('Retreat from the xupptumblers!');
}
*/
