const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for more file extensions if needed
config.resolver.assetExts.push(
  // Audio formats
  'mp4', 'm4a', 'aac', 'wav', 'mp3',
  // Other formats that might be needed
  'db', 'mov', 'avi'
);

// Ensure proper source map support
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;