const inputTemplates = {
  ultrapro9x9: {
    isBinderPage: true,
    cropArea: {
      width: 4960,
      height: 6840,
      offset: {x: 0, y: 0},
    },
    rowSpacing: 0,
    colSpacing: 0,
    pocketMargin: {x: 20, y: 20},
    rows: 3,
    cols: 3
  },
  vikpe2x2: {
    isBinderPage: false,
    cropArea: {
      width: 2816,
      height: 4226,
      offset: {x: 150, y: 310},
    },
    rowSpacing: 820,
    colSpacing: 310,
    pocketMargin: {x: 20, y: 20},
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
    cardWidth: 384,
    thumbnailScale: 0.18,
    galleryThumbnailScale: 0.4,
    playsetSimilarityThreshold: 0.25,
    writeGalleries: false,
    writeSheetFrontsides: false,
    writeThumbnails: false,
    writeArtwork: false,
    writePlaysets: false,
  }
};
