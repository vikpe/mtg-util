const inputTemplates = {
  ultrapro9x9: {
    cropArea: {
      width: 4960,
      height: 6840,
      offset: {x: 0, y: 0},
    },
    rowSpacing: 0,
    colSpacing: 0,
    rows: 3,
    cols: 3
  },
  vikpe2x2: {
    cropArea: {
      width: 4960,
      height: 6840,
      offset: {x: 0, y: 0},
    },
    rowSpacing: 0,
    colSpacing: 0,
    rows: 2,
    cols: 2
  },
};

module.exports = {
  scansSourceDir: 'scans',
  input: inputTemplates.vikpe2x2,
  output: {
    dir: 'dist',
    imageQuality: 90,
    sheetWidth: 1024,
    cardWidth: 512,
    thumbnailScale: 0.18,
    writeSheetFrontsides: true,
    writeThumbnails: true,
    writeArtwork: false
  }
};
