// vendor
const chalk = require('chalk');
const glob = require('glob');
const Jimp = require('jimp');
const ora = require('ora');
const PQueue = require('p-queue');

// custom
const config = require('../mtgUtilConfig');
const imageUtil = require('./imageUtil');
const mtgUtil = require('./mtgUtil');
const spinner = ora();

const writeSheet = scan => new global.Promise(resolve => {
  const distFilePath = `${config.output.dir}/_${scan.sheetId}.jpg`;

  spinner.start(chalk`${scan.imageSourcePath} {grey - overview}`);

  scan.image
      .clone()
      .resize(config.output.sheetWidth, Jimp.AUTO)
      .quality(config.output.imageQuality)
      .write(distFilePath, () => {
        spinner.succeed().stop();
        resolve(scan);
      });
});

const writePocket = (scan, pocketIndex) => new global.Promise(resolve => {
  const pocketNumber = mtgUtil.getPocketNumber(pocketIndex, scan.isFrontside);
  const pocketImage = imageUtil.cropPocketFromScan(scan.image, pocketIndex);
  const pocketId = `${scan.sheetId}-pocket-${pocketNumber}`;

  spinner.start(chalk`{grey - pocket ${pocketNumber}}`);

  if ('auto' !== config.output.cardWidth) {
    pocketImage.resize(config.output.cardWidth, Jimp.AUTO);
  }

  if (scan.isFrontside && config.output.writeArtwork) {
    writeCardArtwork(pocketImage, pocketId);
  }

  const distFilePath = `${config.output.dir}/${pocketId}.jpg`;

  pocketImage
    .quality(config.output.imageQuality)
    .write(distFilePath, () => {
      spinner.succeed().stop();
      resolve(scan);
    });
});

const writeCardArtwork = (cardImage, pocketId) => {
  const distFilePath = `${config.output.dir}/${pocketId.replace('-front-', '-artwork-')}.jpg`;

  imageUtil
    .cropArtworkFromCard(cardImage)
    .resize(120, Jimp.AUTO)
    .write(distFilePath);
};

const getScan = (filePath, scanIndex) => {
  const scanNumber = scanIndex + 1;
  const sheetNumber = mtgUtil.getSheetNumberByScanNumber(scanNumber);
  const isFrontside = mtgUtil.isFrontsideScan(scanNumber);
  const scanSide = isFrontside ? 'front' : 'back';

  const scan = {
    scanIndex,
    scanNumber,
    sheetNumber,
    sheetId: `sheet-${sheetNumber}-${scanSide}`,
    isFrontside,
    imageSourcePath: filePath,
    image: null
  };

  const processScanImage = image => {
    image = imageUtil.cropScan(image);

    if (scan.isFrontside) {
      image.rotate(180);
    }

    return global.Promise.resolve(image);
  };

  return new global.Promise(resolve => {
    Jimp
      .read(scan.imageSourcePath)
      .then(image => processScanImage(image))
      .then(image => {
        scan.image = image;
        resolve(scan);
      });
  });
};

const scanFilePaths = glob.sync(mtgUtil.globs.scans).sort();

console.log(chalk`{green.bold MTG scan util (extract)}`);
console.log(chalk`{grey Found ${scanFilePaths.length} scan(s)..}`);

const queue = new PQueue({ concurrency: 1 });
const numberOfPocketsPerPage = config.input.rows * config.input.cols;

scanFilePaths.forEach((filePath, index) => {
  getScan(filePath, index)
    .then(scan => {

      if (scan.isFrontside && config.output.writeSheetFrontsides) {
        queue.add(() => writeSheet(scan));
      }

      for (let pocketIndex = 0; pocketIndex < numberOfPocketsPerPage; pocketIndex++) {
        queue.add(() => writePocket(scan, pocketIndex));
      }
    });
});
