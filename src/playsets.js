// vendor
const chalk = require("chalk");
const ora = require("ora");
const Jimp = require("jimp");
const glob = require("glob");
const {default: PQueue} = require("p-queue");

// custom
const imageUtil = require("./imageUtil");
const mtgUtil = require("./mtgUtil");
const config = require("../mtgUtilConfig");
const spinner = ora();

const similarityThreshold = config.output.playsetSimilarityThreshold;

const getPlaysets = (imagesData) => {
  const imageDistances = {};
  const imageDiffs = {};
  const imagesThatMatchAnotherImage = [];
  const playsets = {};

  // get all distances
  imagesData.forEach((currentImage, currentIndex) => {
    if (imagesThatMatchAnotherImage.includes(currentIndex)) {
      return;
    }

    imagesData.forEach((otherImage, otherIndex) => {
      if (currentIndex === otherIndex) {
        return;
      }

      const key = [currentIndex, otherIndex].sort().join("x");

      if (imageDistances.hasOwnProperty(key)) {
        return;
      }

      // perceived distance
      const distance = Jimp.distance(currentImage, otherImage);

      // pixel difference
      const diff = Jimp.diff(currentImage, otherImage);

      imageDistances[key] = distance;
      imageDiffs[key] = diff;

      if (
        distance <= similarityThreshold ||
        diff.percent <= similarityThreshold
      ) {
        if (!playsets.hasOwnProperty(currentIndex)) {
          playsets[currentIndex] = [currentIndex];
        }
        playsets[currentIndex].push(otherIndex);
        imagesThatMatchAnotherImage.push(otherIndex);
      }

      // free memory
      imagesData[currentIndex] = null;
    });
  });

  console.log("imageDistances", imageDistances);
  console.log("imageDiffs", imageDistances);

  return playsets;
};

const writePlayset = (artworkFilePaths, destFilePath) => {
  new global.Promise((resolve) => {
    spinner.start(`Writing playset (${artworkFilePaths.length} images)`);

    const frontSideFilePaths = artworkFilePaths.map((filePath) =>
      filePath.replace("-artwork-", "-front-")
    );
    const backSideFilePaths = artworkFilePaths.map((filePath) =>
      filePath.replace("-artwork-", "-back-")
    );

    const frontSidePromise = imageUtil
      .readImages(frontSideFilePaths)
      .then((images) => imageUtil.combineHorizontally(images));
    const backSidePromise = imageUtil
      .readImages(backSideFilePaths)
      .then((images) => imageUtil.combineHorizontally(images));

    Promise.all([frontSidePromise, backSidePromise])
      .then((allSides) => imageUtil.combineVertically(allSides))
      .then((playsetImage) => {
        playsetImage.write(destFilePath, () => {
          spinner.succeed().stop();
          resolve();
        });
      });
  });
};

const run = () => {
  const artworkFilePaths = glob.sync(mtgUtil.globs.artwork);

  console.log(chalk`{green.bold MTG scan util (find playsets)}`);
  console.log(chalk`{grey Found ${artworkFilePaths.length} card(s)..}`);

  const queue = new PQueue({concurrency: 1});

  imageUtil
    .readImages(artworkFilePaths)
    .then((imagesData) => {
      const playsets = getPlaysets(imagesData);
      const numberOfPlaysets = Object.keys(playsets).length;

      console.log(chalk`{grey Found ${numberOfPlaysets} playset(s)..}`,
        playsets);
      return playsets;
    })
    .then((playsets) => {
      // write playsets
      Object.values(playsets).forEach((imageIndexes, playsetIndex) => {
        const filePaths = imageIndexes.map((index) => artworkFilePaths[index]);

        queue.add(() =>
          writePlayset(filePaths, `dist/playset-${1 + playsetIndex}.jpg`)
        );
      });
    });
}

if (config.output.writePlaysets) {
  run();
}
