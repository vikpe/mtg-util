// vendor
const glob = require('glob');

// custom
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');

const isFrontsideScan = scanNumber => (1 === (scanNumber % 2));
const getSheetNumberByScanNumber = scanNumber => Math.floor((1 + scanNumber) / 2);

const getRowIndexByPocketIndex = pocketIndex => Math.floor(pocketIndex / config.sheet.rows);
const getColIndexByPocketIndex = pocketIndex => (pocketIndex % config.sheet.cols);

const getPocketNumber = (pocketIndex, isFrontsideScan = false) => {
  if (isFrontsideScan) {
    return pocketIndex + 1;
  }
  else {
    const rowIndex = getRowIndexByPocketIndex(pocketIndex);
    const colIndex = getColIndexByPocketIndex(pocketIndex);

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

const getFrontsideFilePaths = () => glob.sync(globs.frontsides);
const getThumbnailFilePaths = () => glob.sync(globs.thumbnail);

const suffixes = {
  front: 'front',
  back: 'back',
  combined: 'combined',
  thumbnail: 't'
};

const globs = {
  scans: 'scans/*',
  thumbnails: `${config.output.dir}/*-card-*-${suffixes.thumbnail}.*`,
  frontsides: `${config.output.dir}/*-front-pocket-*.*`,
  filesToClean: `${config.output.dir}/*+(front|back|artwork)*.*`
};

module.exports = {
  getFrontsideFilePaths,
  getThumbnailFilePaths,
  isFrontsideScan,
  getSheetNumberByScanNumber,
  getRowIndexByPocketIndex,
  getColIndexByPocketIndex,
  getPocketNumber,
  suffixes,
  globs
};
