module.exports = {
  input: {
    dir: 'scans',
    width: 4960,
    height: 6840,
    rows: 3,
    cols: 3
  },
  output: {
    dir: 'dist',
    imageQuality: 85,
    sheetWidth: 1024,
    cardWidth: 512,
    writeSheetFrontsides: true,
    writeArtwork: false
  }
};
