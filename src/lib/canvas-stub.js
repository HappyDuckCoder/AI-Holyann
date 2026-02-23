// Canvas stub for browser environments
// This file is used to prevent "canvas" module resolution errors in Turbopack
// The canvas module is only needed for Node.js PDF rendering, not in browser

module.exports = {
  createCanvas: () => ({
    getContext: () => ({}),
    toBuffer: () => Buffer.from([]),
    toDataURL: () => '',
  }),
  loadImage: () => Promise.resolve({}),
};
