const Jimp = require('jimp');
const _sum = require('lodash/sum');

const readImages = filePaths => {
  const promises = filePaths.map(filePath => Jimp.read(filePath));
  return global.Promise.all(promises);
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
  combineHorizontally,
  combineVertically
};
