const config = require('./mtgUtilConfig');
const Jimp = require('jimp');
const glob = require('glob');

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
const frontSideScans = () => glob.sync(`${config.output.dir}/*-card-*-a.*`);

module.exports = {
  frontSideScans,
  getOutputImage,
  getImageInfo
};
