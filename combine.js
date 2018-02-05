// vendor
const chalk = require('chalk');
const ora = require('ora');
const glob = require('glob');

// config
const config = require('./mtgUtilConfig');
const imageUtil = require('./imageUtil');

console.log(chalk`{green.bold MTG scan util (combine)}`);

glob(`${config.output.dir}/*-card-*-a.*`, (err, frontSideScans) => {

  console.log(chalk`{grey Found ${frontSideScans.length} card(s)..}`);

  frontSideScans.forEach(fileName => {
    const frontSidePath = fileName;
    const backsidePath = frontSidePath.replace('-a.', '-b.');
    const combinedPath = frontSidePath.replace('-a.', '-c.');
    const basePath = frontSidePath.replace('-a.jpg', '');

    let spinner = new ora().start(basePath);

    imageUtil
      .readImages([frontSidePath, backsidePath])
      .then(images => imageUtil.combineHorizontally(images))
      .then(combinedImage => combinedImage.write(combinedPath, () => {
        spinner.succeed(basePath).stop();
      }));
  });

});

