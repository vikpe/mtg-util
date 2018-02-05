const Jimp = require('jimp');
const glob = require('glob');
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');

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
