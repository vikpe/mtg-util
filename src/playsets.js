// vendor
const chalk = require("chalk");
const Jimp = require("jimp");
const glob = require("glob");

// custom
const imageUtil = require("./imageUtil");
const mtgUtil = require("./mtgUtil");

const similarityThreshold = 0.1;
const artworkFilePaths = glob.sync(mtgUtil.globs.artwork);

console.log(chalk`{green.bold MTG scan util (find playsets)}`);
console.log(chalk`{grey Found ${artworkFilePaths.length} card(s)..}`);

imageUtil
  .readImages(artworkFilePaths)
  .then(imagesData => {
    // get all distances
    const imageDistances = {};
    const imagesThatMatchAnotherImage = [];
    const playsets = {};

    imagesData.forEach((currentImage) => {
      if (imagesThatMatchAnotherImage.includes(currentImage.fileName)) {
        return;
      }

      imagesData.forEach((otherImage) => {
        if (currentImage.fileName === otherImage.fileName) {
          return;
        }
        else if (currentImage.sheetNumber !== otherImage.sheetNumber) {
          return;
        }

        const key = [currentImage.fileName, otherImage.fileName].sort().join('|');

        if (imageDistances.hasOwnProperty(key)) {
          return;
        }

        const distance = Jimp.distance(
          currentImage.thumbnail,
          otherImage.thumbnail
        );

        imageDistances[key] = distance;

        if (distance <= similarityThreshold) {
          if (!playsets.hasOwnProperty(currentImage.fileName)) {
            playsets[currentImage.fileName] = [currentImage.fileName];
          }
          playsets[currentImage.fileName].push(otherImage.fileName);
          imagesThatMatchAnotherImage.push(otherImage.fileName);
        }
      });
    });

    // determine playsets
    console.log(playsets);

    Object.values(playsets).forEach(imageFileNames => {

      console.log(imageFileNames);
    });
  });
