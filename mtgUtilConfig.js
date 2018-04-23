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
    imageQuality: 90,
    sheetWidth: 1024,
    cardWidth: 400, // a number or 'auto',
    writeSheetFrontsides: true,
    writeArtwork: false
  }
};
