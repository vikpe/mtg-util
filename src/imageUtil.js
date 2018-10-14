const Jimp = require('jimp');
const _sum = require('lodash/sum');
const config = require('../mtgUtilConfig');
const mtgUtil = require('./mtgUtil');

const readImages = filePaths => {
  const promises = filePaths.map(filePath => Jimp.read(filePath));
  return global.Promise.all(promises);
};

const cropScan = scanImage => {
  return scanImage.crop(
    config.input.cropArea.offset.x,
    config.input.cropArea.offset.y,
    config.input.cropArea.width,
    config.input.cropArea.height
  );
};

const cropArtworkFromCard = cardImage => {
  const horizontalOffset = 0.15;
  const topOffset = 0.14;
  const artWorkHeight = 0.4;

  return cardImage
    .clone()
    .crop(
      cardImage.bitmap.width * horizontalOffset,
      cardImage.bitmap.height * topOffset,
      cardImage.bitmap.width * (1 - (2 * horizontalOffset)),
      cardImage.bitmap.height * artWorkHeight
    );
};

const cropPocketFromScan = (scanImage, slotIndex) => {
  const rowIndex = mtgUtil.getRowIndexByPocketIndex(slotIndex);
  const colIndex = mtgUtil.getColIndexByPocketIndex(slotIndex);

  const pocketWidth = Math.floor(config.input.cropArea.width / config.input.cols) - (config.input.colSpacing / 2);
  const pocketHeight = Math.floor(config.input.cropArea.height / config.input.rows) - (config.input.rowSpacing / 2);
  const pocketOffset = {
    x: (colIndex * pocketWidth) + (colIndex * config.input.colSpacing),
    y: (rowIndex * pocketHeight) + (rowIndex * config.input.rowSpacing),
  };

  return scanImage
    .clone()
    .crop(
      pocketOffset.x + config.input.pocketMargin.x,
      pocketOffset.y + config.input.pocketMargin.y,
      pocketWidth - (2 * config.input.pocketMargin.x),
      pocketHeight - (2 * config.input.pocketMargin.y)
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

const gallerize = (images) => new global.Promise(resolve => {
  const galleryWidth = 1024;
  const galleryHeight = 1024;
  const cols = 4;
  const rows = 3;
  const maxImageWidth = Math.floor(galleryWidth / cols);
  const maxImageHeight = Math.floor(galleryHeight / rows);

  // shrink images
  images = images.map(image => image.scaleToFit(maxImageWidth, maxImageHeight, Jimp.RESIZE_BICUBIC));

  // calculate totalt width/height used
  // in order to center align gallery
  const firstRowTotalWidth = _sum(images.slice(0, cols).map(image => image.bitmap.width));
  const firstRowMaxHeight = Math.max(...images.slice(0, cols).map(image => image.bitmap.height));
  const offsetX = Math.round((galleryWidth - firstRowTotalWidth) / 2);
  const offsetY = Math.round((galleryHeight - (firstRowMaxHeight*rows)) / 2);

  new Jimp(galleryWidth, galleryHeight, (err, galleryImage) => {
    if (err) {
      throw err;
    }

    let colIndex = 0;
    let rowIndex = 0;
    let nextX = 0 + offsetX;
    let nextY = 0 + offsetY;

    // combine to gallery
    galleryImage.background(0xF2F2F2FF);

    images.forEach(image => {
      galleryImage = galleryImage.blit(image, nextX, nextY);
      colIndex++;

      if ((colIndex % cols) === 0) {
        colIndex = 0;
        rowIndex++;

        nextX = 0 + offsetX;
        nextY += image.bitmap.height;
      }
      else {
        nextX += image.bitmap.width;
      }
    });

    resolve(galleryImage);
  });
});

module.exports = {
  readImages,
  cropPocketFromScan,
  cropScan,
  cropArtworkFromCard,
  combineHorizontally,
  combineVertically,
  gallerize
};
