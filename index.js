const argv = require('yargs').argv;
const Jimp = require('jimp');
const fs = require('fs');

const sheetConfig = {
  sheetWidth: 2680,
  sheetHeight: 3508,
  sheetPaddingTop: 0,
  sheetPaddingRight: 0,
  sheetPaddingBottom: 0,
  sheetPaddingLeft: 180,

  rows: 3,
  cols: 3
};

const inputDir = 'scans';

const outputConfig = {
  dir: 'dist',
  imageQuality: 90,
  overviewWidth: 1024
};

const createOverview = originalImage => {
  originalImage
    .clone()
    .resize(outputConfig.overviewWidth, Jimp.AUTO)
    .quality(outputConfig.imageQuality)
    .write(`${outputConfig.dir}/overview.jpg`);
};

const gallerizeImageByFilePath = filePath => {
  console.log(filePath);

  Jimp.read(filePath).then(image => {

    // Save copy of original file
    const originalImage = image.clone();

    // overview
    createOverview(originalImage);

    // each pocket
    const numberOfPockets = sheetConfig.rows * sheetConfig.cols;

    for (let cardIndex = 0; cardIndex < numberOfPockets; cardIndex++) {
      const slotNumber = cardIndex + 1;
      const rowNumber = 1 + Math.floor(cardIndex / sheetConfig.rows);
      const colNumber = 1 + (cardIndex % sheetConfig.cols);

      console.log(cardIndex, `slot: ${slotNumber}, row: ${rowNumber}, col: ${colNumber}`);
    }

  }).catch(err => console.log(err));
};

const scans = fs.readdirSync(inputDir);
scans.forEach((filename, index) => {
  gallerizeImageByFilePath(`${inputDir}/${filename}`);
});

if (argv.ships > 3 && argv.distance < 53.5) {
  console.log('Plunder more riffiwobbles!');
} else {
  console.log('Retreat from the xupptumblers!');
}
