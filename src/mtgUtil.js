// vendor
const glob = require("glob");

// custom
const config = require("../mtgUtilConfig");

const isFrontsideScan = (scanNumber) => 1 === scanNumber % 2;
const getSheetNumberByScanNumber = (scanNumber) =>
  Math.floor((1 + scanNumber) / 2);

const getRowIndexByPocketIndex = (pocketIndex) =>
  Math.floor(pocketIndex / config.input.rows);
const getColIndexByPocketIndex = (pocketIndex) =>
  pocketIndex % config.input.cols;

const getPocketNumber = (pocketIndex, isFrontsideScan = false) => {
  if (!isFrontsideScan && config.input.isBinderPage) {
    const colIndex = getColIndexByPocketIndex(pocketIndex);
    const rowIndex = getRowIndexByPocketIndex(pocketIndex);
    return config.input.cols * (rowIndex + 1) - colIndex;
  } else {
    return pocketIndex + 1;
  }
};

const getImageInfo = (fileName) => {
  const parts = fileName.split("-");

  const sheetNumberIndex = 1;
  const cardNumberIndex = 3;
  const sideLetterIndex = 4;

  return {
    fileName,
    baseName: fileName.substr(0, fileName.length - 6),
    sheetNumber: parts[sheetNumberIndex],
    cardNumber: parts[cardNumberIndex],
    side: parts[sideLetterIndex],
    ext: fileName.split(".")[1],
  };
};

const getFrontsideFilePaths = () => {
  const files = glob.sync(globs.frontsides);
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  const sortedFiles = files.sort(collator.compare);

  return sortedFiles;
};

const globs = {
  scans: `${config.scansSourceDir}/*`,
  artwork: `${config.output.dir}/*-artwork-pocket-*.*`,
  frontsides: `${config.output.dir}/*-front-pocket-*.*`,
  filesToClean: `${config.output.dir}/*+(front-pocket|back|artwork)*.*`,
  allDistFiles: `${config.output.dir}/*.*`,
};

module.exports = {
  getFrontsideFilePaths,
  isFrontsideScan,
  getSheetNumberByScanNumber,
  getRowIndexByPocketIndex,
  getColIndexByPocketIndex,
  getPocketNumber,
  globs,
};
