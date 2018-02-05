// vendor
const chalk = require('chalk');
const glob = require('glob');
const Jimp = require('jimp');
const ora = require('ora');

// custom
const config = require('../mtgUtilConfig');
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');

const extractScan = (scanNumber, filePath) => {
  const isFrontsideScan = mtgUtil.isFrontsideScan(scanNumber);
  const sheetNumber = mtgUtil.getSheetNumberByScanNumber(scanNumber);
  const fileNameSuffix = (isFrontsideScan) ? mtgUtil.suffixes.front : mtgUtil.suffixes.back;

  let fileSpinner = new ora().start(chalk`${filePath} - {grey overview}`);

  Jimp.read(filePath).then(scanImage => {
    // crop (and rotate frontside scan)
    scanImage = imageUtil.cropScan(scanImage);

    if (isFrontsideScan) {
      scanImage = scanImage.rotate(180);
    }

    // overview
    scanImage
      .clone()
      .resize(config.output.overviewWidth, Jimp.AUTO)
      .quality(config.output.imageQuality)
      .write(`${config.output.dir}/sheet-${sheetNumber}-${fileNameSuffix}.jpg`);

    // pockets
    const numberOfSlotsPerSheet = config.sheet.rows * config.sheet.cols;

    for (let slotIndex = 0; slotIndex < numberOfSlotsPerSheet; slotIndex++) {
      const slotNumber = mtgUtil.getSlotNumber(slotIndex, isFrontsideScan);

      fileSpinner.start(chalk`${filePath} - {grey slot ${slotNumber}}`);

      const distFileName = `sheet-${sheetNumber}-card-${slotNumber}-${fileNameSuffix}.jpg`;
      const distFilePath = `${config.output.dir}/${distFileName}`;

      let result = imageUtil.cropSlotFromScan(scanImage, slotIndex);

      if ('auto' !== config.output.cardWidth) {
        result.resize(config.output.cardWidth, Jimp.AUTO);
      }

      result.write(distFilePath);

      // artwork
      if (isFrontsideScan) {
        imageUtil
          .cropArtworkFromCard(result)
          .resize(120, Jimp.AUTO)
          .write(distFilePath.replace(`-${mtgUtil.suffixes.front}.`, `-${mtgUtil.suffixes.thumbnail}.`));
      }

      fileSpinner.stop();
    }

    fileSpinner.succeed(filePath);

  }).catch(err => console.log(err));
};

const scans = glob.sync(mtgUtil.globs.scans);

console.log(chalk`{green.bold MTG scan util (extract)}`);
console.log(chalk`{grey Found ${scans.length} scan(s)..}`);

scans.forEach((filePath, index) => {
  const scanNumber = index + 1;
  extractScan(scanNumber, filePath);
});
