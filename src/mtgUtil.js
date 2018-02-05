// vendor
const Jimp = require('jimp');
const glob = require('glob');

// custom
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');

const isFrontsideScan = scanNumber => (1 === (scanNumber % 2));
const getSheetNumberByScanNumber = scanNumber => Math.floor((1 + scanNumber) / 2);

const getRowIndexBySlotIndex = slotIndex => Math.floor(slotIndex / config.sheet.rows);
const getColIndexBySlotIndex = slotIndex => (slotIndex % config.sheet.cols);

const getSlotNumber = (slotIndex, isFrontsideScan = false) => {
  if (isFrontsideScan) {
    return slotIndex + 1;
  }
  else {
    const rowIndex = getRowIndexBySlotIndex(slotIndex);
    const colIndex = getColIndexBySlotIndex(slotIndex);

    return (config.sheet.cols * (rowIndex + 1)) - colIndex;
  }
};

const getImageInfo = fileName => {
  const parts = fileName.split('-');

  const sheetNumberIndex = 1;
  const cardNumberIndex = 3;
  const sideLetterIndex = 4;

  return {
    fileName,
    baseName: fileName.substr(0, fileName.length - 6),
    sheetNumber: parts[sheetNumberIndex],
    cardNumber: parts[cardNumberIndex],
    side: parts[sideLetterIndex],
    ext: fileName.split('.')[1]
  };
};

const getOutputImage = fileName => Jimp.read(`${config.output.dir}/${fileName}`);
const frontsideFilePaths = () => glob.sync(mtgUtil.globs.frontsides);
const thumbnailFilePaths = () => glob.sync(mtgUtil.globs.thumbnail);

const suffixes = {
  front: 'a',
  back: 'b',
  combined: 'c',
  thumbnail: 't'
};

module.exports = {
  frontsideFilePaths,
  thumbnailFilePaths,
  isFrontsideScan,
  getSheetNumberByScanNumber,
  getRowIndexBySlotIndex,
  getColIndexBySlotIndex,
  getSlotNumber,
  getOutputImage,
  getImageInfo,
  suffixes,
  globs: {
    scans: 'scans/*',
    thumbnails: `${config.output.dir}/*-card-*-${suffixes.thumbnail}.*`,
    frontsides: `${config.output.dir}/*-card-*-${suffixes.front}.*`,
    filesToClean: `${config.output.dir}/*-card-*-[abt].*`
  }
};
