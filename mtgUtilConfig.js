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
    pocketWidth: 400, // a number or 'auto',
    writeArtwork: false
  }
};
