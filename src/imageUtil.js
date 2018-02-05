const Jimp = require('jimp');
const _sum = require('lodash/sum');
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');

const readImages = filePaths => {
  const promises = filePaths.map(filePath => Jimp.read(filePath));
  return global.Promise.all(promises);
};

const cropScan = scanImage => {
  return scanImage.crop(0, 0, config.sheet.width, config.sheet.height);
};

const cropArtworkFromCard = cardImage => {
  const horizontalOffset = 0.15;
  const topOffset = 0.1;
  const artWorkHeight = 0.5;

  return cardImage
    .clone()
    .crop(
      cardImage.bitmap.width * horizontalOffset,
      cardImage.bitmap.height * topOffset,
      cardImage.bitmap.width * (1 - (2 * horizontalOffset)),
      cardImage.bitmap.height * artWorkHeight
    );
};

const cropSlotFromScan = (scanImage, slotIndex) => {
  const rowIndex = mtgUtil.getRowIndexBySlotIndex(slotIndex);
  const colIndex = mtgUtil.getColIndexBySlotIndex(slotIndex);

  const slotWidth = Math.floor(config.sheet.width / config.sheet.cols);
  const slotHeight = Math.floor(config.sheet.height / config.sheet.rows);

  const x = colIndex * slotWidth;
  const y = rowIndex * slotHeight;

  return scanImage
    .clone()
    .crop(
      x,
      y,
      slotWidth,
      slotHeight
    );
};

const combineHorizontally = (images) => new global.Promise(resolve => {
  const resultWidth = _sum(images.map(image => image.bitmap.width));
  const resultHeight = Math.max(...images.map(image => image.bitmap.height));

  new Jimp(resultWidth, resultHeight, (err, combinedImage) => {
    if (err) {
      throw err;
    }

    let nextX = 0;

    images.forEach(image => {
      combinedImage = combinedImage.blit(image, nextX, 0);
      nextX += image.bitmap.width;
    });

    resolve(combinedImage);
  });
});

const combineVertically = (images) => new global.Promise(resolve => {
  const resultWidth = Math.max(...images.map(image => image.bitmap.width));
  const resultHeight = _sum(images.map(image => image.bitmap.height));

  new Jimp(resultWidth, resultHeight, (err, combinedImage) => {
    if (err) {
      throw err;
    }

    let nextY = 0;

    images.forEach(image => {
      combinedImage = combinedImage.blit(image, 0, nextY);
      nextY += image.bitmap.height;
    });

    resolve(combinedImage);
  });
});

module.exports = {
  readImages,
  cropSlotFromScan,
  cropScan,
  cropArtworkFromCard,
  combineHorizontally,
  combineVertically
};
